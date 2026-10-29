import type { BaseMessage } from "@langchain/core/messages";
import type { z } from "zod";
import type { GenerationModel } from "../../src/features/site-creation/generation/index";
import type { SiteContent } from "../../src/features/static-site-generator/site-content";

// The AI is a dependency of the code under test, so tests pass this stub instead of a real model.

export type StubCall = {
  name: string;
  prompt: string;
  signal: AbortSignal;
};

export type StubModel = {
  model: GenerationModel;
  calls: StubCall[];
};

export type StubAnswer = { blocks: Record<string, Record<string, unknown>> };

export const stubProfile = {
  positioning: "A calm studio for considered interiors.",
  summary: "The studio designs interiors.",
  services: ["Interior design"],
  differentiators: ["Calm process"],
  tone: "Warm",
  keywords: ["interiors"],
};

export function stubModel(
  answer: (call: StubCall) => unknown,
  answerProfile: (call: StubCall) => unknown = () => stubProfile,
): StubModel {
  const calls: StubCall[] = [];
  const model: GenerationModel = {
    withStructuredOutput<Output extends Record<string, unknown>>(
      _schema: z.ZodType<Output>,
      config: { name: string },
    ) {
      return {
        invoke: async (messages: BaseMessage[], options: { signal: AbortSignal }) => {
          const call = {
            name: config.name,
            prompt: String(messages.at(-1)?.content),
            signal: options.signal,
          };
          calls.push(call);
          const respond = call.name === "business_profile" ? answerProfile : answer;
          return (await respond(call)) as Output;
        },
      };
    },
  };

  return { model, calls };
}

// Every string (text, image src, link href, fact data …) becomes "<marker>:<blockId>:<n>".
export function markStrings(value: unknown, marker: string, blockId: string): unknown {
  let count = 0;

  function mark(current: unknown): unknown {
    if (typeof current === "string") {
      count += 1;
      return `${marker}:${blockId}:${count}`;
    }

    if (Array.isArray(current)) {
      return current.map(mark);
    }

    if (typeof current === "object" && current !== null) {
      return Object.fromEntries(Object.entries(current).map(([key, item]) => [key, mark(item)]));
    }

    return current;
  }

  return mark(value);
}

// An answer for every block of the site (copy and fact), every string marked.
export function markedAnswer(content: SiteContent, marker: string): StubAnswer {
  return {
    blocks: Object.fromEntries(
      content.pages.flatMap((page) =>
        page.blocks.map((block) => [
          block.id,
          markStrings(block.props[content.defaultLocale], marker, block.id) as Record<
            string,
            unknown
          >,
        ]),
      ),
    ),
  };
}

export function callsNamed(stub: StubModel, name: string): StubCall[] {
  return stub.calls.filter((call) => call.name === name);
}
