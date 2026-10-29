import { ChatOpenAI } from "@langchain/openai";

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
