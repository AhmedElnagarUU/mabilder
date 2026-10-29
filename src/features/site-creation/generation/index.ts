import type { BaseMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import type { z } from "zod";

// The part of the chat model that generation uses. Tests pass a stub with the same shape.
export type GenerationModel = {
  withStructuredOutput<Output extends Record<string, unknown>>(
    schema: z.ZodType<Output>,
    config: { name: string },
  ): {
    invoke(messages: BaseMessage[], options: { signal: AbortSignal }): Promise<Output>;
  };
};

// OpenRouter speaks the OpenAI API, so ChatOpenAI only needs its base URL.
export function createGenerationModel(): ChatOpenAI {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set.");
  }

  return new ChatOpenAI({
    apiKey,
    model: process.env.OPENROUTER_MODEL ?? "xingchen-agi/xing4.0-29b-a4b:free",
    configuration: { baseURL: "https://openrouter.ai/api/v1" },
    temperature: 0.7,
    maxRetries: 0,
  });
}
