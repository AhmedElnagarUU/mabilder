import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { splitList } from "../text";
import type { BusinessBrief } from "../types";
import { buildProfilePrompt, profileSystemPrompt } from "./prompts";
import { isRetryable, requestOptions, runRateLimited } from "./rate-limit";

export const businessProfileSchema = z.object({
  positioning: z.string(),
  summary: z.string(),
  services: z.array(z.string()),
  differentiators: z.array(z.string()),
  tone: z.string(),
  keywords: z.array(z.string()),
});

export type BusinessProfile = z.infer<typeof businessProfileSchema>;

export function fallbackProfile(brief: BusinessBrief): BusinessProfile {
  const services = splitList(brief.services);

  return {
    positioning: `${brief.businessName} works in ${brief.industry}.`,
    summary: brief.description,
    services: services.length > 0 ? services : [brief.industry],
    differentiators: [],
    tone: brief.tone ?? "Clear, confident, and approachable",
    keywords: [],
  };
}

export async function normalizeBusinessProfile(
  model: ChatOpenAI,
  brief: BusinessBrief,
): Promise<BusinessProfile> {
  try {
    const structured = model.withStructuredOutput(businessProfileSchema, {
      name: "business_profile",
    });
    const result = await runRateLimited(() =>
      structured.invoke(
        [
          new SystemMessage(profileSystemPrompt),
          new HumanMessage(buildProfilePrompt(brief)),
        ],
        requestOptions(),
      ),
    );

    return businessProfileSchema.parse(result);
  } catch (error) {
    if (isRetryable(error)) {
      throw error;
    }

    console.error("Business profile generation failed; using fallback.", error);
    return fallbackProfile(brief);
  }
}
