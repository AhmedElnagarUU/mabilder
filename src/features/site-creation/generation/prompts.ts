import type { BusinessBrief } from "../types";

export const profileSystemPrompt = `You are a senior brand strategist. You turn a business brief into a compact profile that website writers can use. You never invent facts, awards, clients, credentials, numbers, dates, or personal names. Return only the requested structured data.`;

export function buildProfilePrompt(brief: BusinessBrief): string {
  return `Create a business profile from this brief.

Brief:
${JSON.stringify(brief, null, 2)}

Rules:
- Use only the information in the brief.
- If services are provided, keep their meaning and wording close.
- If services are not provided, infer 3-5 service categories from the description without naming specific clients or outcomes.
- Positioning is one sentence.
- Summary is 2-3 sentences.
- Differentiators are 3-5 short points grounded in the description.
- Tone is a short descriptor.
- Keywords are 5-10 short terms.
- Do not invent awards, clients, numbers, credentials, dates, or personal names.`;
}
