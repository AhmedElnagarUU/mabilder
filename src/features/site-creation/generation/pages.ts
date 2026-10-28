import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import {
  buildPagePrompt,
  pageSystemPrompt,
  type PagePromptInput,
} from "./prompts";
import { requestOptions, runRateLimited } from "./rate-limit";

export const pageEntriesSchema = z.object({
  entries: z.array(
    z.object({
      path: z.string(),
      text: z.string(),
    }),
  ),
});

export type PageEntries = z.infer<typeof pageEntriesSchema>;

function findMissing(entries: PageEntries, paths: string[]): string[] {
  const received = new Set(entries.entries.map((entry) => entry.path));

  return paths.filter((path) => !received.has(path));
}

export async function generatePageEntries(
  model: ChatOpenAI,
  input: PagePromptInput,
): Promise<Map<string, string>> {
  const structured = model.withStructuredOutput(pageEntriesSchema, {
    name: "page_content",
  });
  const prompt = buildPagePrompt(input);
  const allowed = new Set(input.paths);

  let entries = pageEntriesSchema.parse(
    await runRateLimited(() =>
      structured.invoke(
        [
          new SystemMessage(pageSystemPrompt),
          new HumanMessage(prompt),
        ],
        requestOptions(),
      ),
    ),
  );
  let missing = findMissing(entries, input.paths);

  if (missing.length > 0) {
    const retryPrompt = `${prompt}

Your previous response missed these paths:
${missing.join("\n")}

Return a complete response with one entry for every allowed path.`;

    entries = pageEntriesSchema.parse(
      await runRateLimited(() =>
        structured.invoke(
          [
            new SystemMessage(pageSystemPrompt),
            new HumanMessage(retryPrompt),
          ],
          requestOptions(),
        ),
      ),
    );
    missing = findMissing(entries, input.paths);
  }

  if (missing.length > 0) {
    throw new Error(
      `The AI response missed ${missing.length} text path${
        missing.length === 1 ? "" : "s"
      } on the ${input.pageLabel} page.`,
    );
  }

  const result = new Map<string, string>();

  for (const entry of entries.entries) {
    if (allowed.has(entry.path)) {
      result.set(entry.path, entry.text.trim());
    }
  }

  return result;
}
