import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import type { Block } from "../../static-site-generator/blocks/catalog";
import type { Locale } from "../../static-site-generator/locale";
import {
  parseWrittenProps,
  toModelSchema,
  writableSchema,
  type Props,
} from "./copy-fields";
import type { GenerationModel } from "./index";
import type { BlockPromptInput } from "./prompts";
import { isRetryable, requestOptions, runRateLimited } from "./rate-limit";
import type { SpendGuard } from "./spend-guard";

// One block for the AI: `current` is the text it sees (to rewrite or to translate).
export type CopyTarget = {
  block: Block;
  current: Props;
};

export type CopyCall = {
  name: string;
  system: string;
  buildPrompt: (blocks: BlockPromptInput[]) => string;
};

type CopyAnswer = { blocks: Record<string, unknown> };

const maxLoggedAnswer = 500;

function currentProps(block: Block, locale: Locale): Props {
  return block.props[locale] as Props;
}

// The exact schema sent to the model: { blocks: { "<blockId>": writable fields, … } }.
export function buildOutputSchema(targets: CopyTarget[], locale: Locale): z.ZodType<CopyAnswer> {
  return z.object({
    blocks: z.object(
      Object.fromEntries(
        targets.map(({ block }) => [
          block.id,
          toModelSchema(writableSchema(block.type, currentProps(block, locale))),
        ]),
      ),
    ),
  }) as unknown as z.ZodType<CopyAnswer>;
}

function toPromptInput(target: CopyTarget, locale: Locale): BlockPromptInput {
  const { block } = target;

  return {
    id: block.id,
    type: block.type,
    variant: block.variant,
    fields: z.toJSONSchema(writableSchema(block.type, currentProps(block, locale))),
    current: target.current,
  };
}

async function invokeModel(
  model: GenerationModel,
  call: CopyCall,
  targets: CopyTarget[],
  locale: Locale,
  guard: SpendGuard,
): Promise<CopyAnswer> {
  const prompt = call.buildPrompt(targets.map((target) => toPromptInput(target, locale)));
  const structured = model.withStructuredOutput(buildOutputSchema(targets, locale), {
    name: call.name,
  });

  return runRateLimited(() => {
    guard.startCall();
    return structured.invoke(
      [new SystemMessage(call.system), new HumanMessage(prompt)],
      requestOptions(guard.signal),
    );
  });
}

function truncate(text: string): string {
  return text.length > maxLoggedAnswer ? `${text.slice(0, maxLoggedAnswer)}…` : text;
}

function logInvalidBlock(block: Block, issues: string[], answer: unknown): void {
  console.warn(
    `AI copy for block ${block.id} (${block.type}) is invalid: ${issues.join("; ")}. ` +
      `Answer: ${truncate(JSON.stringify(answer) ?? "undefined")}`,
  );
}

function validateAnswer(
  targets: CopyTarget[],
  locale: Locale,
  answer: CopyAnswer,
): Map<string, Props> {
  const written = new Map<string, Props>();

  for (const { block } of targets) {
    const raw = answer.blocks?.[block.id];
    const result = parseWrittenProps(block.type, currentProps(block, locale), raw);

    if (result.ok) {
      written.set(block.id, result.props);
    } else {
      logInvalidBlock(block, result.issues, raw);
    }
  }

  return written;
}

// A broken answer counts as "every block failed", so the follow-up call retries them.
async function requestCopy(
  model: GenerationModel,
  call: CopyCall,
  targets: CopyTarget[],
  locale: Locale,
  guard: SpendGuard,
): Promise<Map<string, Props>> {
  try {
    return validateAnswer(targets, locale, await invokeModel(model, call, targets, locale, guard));
  } catch (error) {
    if (isRetryable(error) || guard.signal.aborted) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.warn(`AI copy call "${call.name}" returned unusable output: ${truncate(message)}`);
    return new Map();
  }
}

// Writes the props of every target in `locale`. Failed blocks are retried once in a single call.
export async function writeCopy(
  model: GenerationModel,
  call: CopyCall,
  targets: CopyTarget[],
  locale: Locale,
  guard: SpendGuard,
): Promise<Map<string, Props>> {
  const written = await requestCopy(model, call, targets, locale, guard);
  const failed = targets.filter((target) => !written.has(target.block.id));

  if (failed.length === 0) {
    return written;
  }

  const retried = await requestCopy(model, call, failed, locale, guard);
  const stillFailed = failed.filter((target) => !retried.has(target.block.id));

  if (stillFailed.length > 0) {
    const ids = stillFailed.map((target) => target.block.id).join(", ");
    throw new Error(`AI copy is invalid for blocks: ${ids}.`);
  }

  return new Map([...written, ...retried]);
}
