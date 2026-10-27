import type { BusinessBrief } from "../types";
import type { BusinessProfile } from "./profile";

export const profileSystemPrompt = `You are a senior brand strategist. You turn a business brief into a compact profile that website writers can use. You never invent facts, awards, clients, credentials, numbers, dates, or personal names. Return only the requested structured data.`;

export const pageSystemPrompt = `You are a senior website copywriter. You write concise, specific, human copy for a fixed website template. You never invent facts. Return only the requested structured data.`;

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

export type PagePromptInput = {
  pageLabel: string;
  brief: BusinessBrief;
  profile: BusinessProfile;
  structure: unknown;
  paths: string[];
};

export function buildPagePrompt(input: PagePromptInput): string {
  return `Write the copy for the "${input.pageLabel}" page.

Business brief:
${JSON.stringify(input.brief, null, 2)}

Business profile:
${JSON.stringify(input.profile, null, 2)}

Fixed page structure:
${JSON.stringify(input.structure, null, 2)}

Allowed text paths:
${JSON.stringify(input.paths, null, 2)}

Rules:
- Return exactly one entry for every allowed path. Do not add paths.
- The structure's links, image URLs, icons, layout variants, IDs, and other technical fields are fixed. Do not change them.
- Use only facts from the brief and profile. Never invent awards, clients, credentials, numbers, dates, or personal names.
- If a fact is missing, write qualitative copy instead of inventing a number, name, or date.
- For portfolio and project items, describe typical project types. Do not name real clients or claim specific outcomes.
- For team items, do not invent personal names. Use role titles as names and describe responsibilities.
- For image alt text, describe the image in a few words without inventing a specific place, client, or person.
- The template section keys (architecture, engineering, interiors, advisory, and so on) are layout labels. Write visible headings that fit the business while keeping the same structure.
- Keep headlines under 70 characters, body copy to 1-2 sentences, and list items under 100 characters unless the path clearly needs more.
- Match this tone: ${input.profile.tone}.
- Do not mention AI, templates, placeholders, or the word "lorem".
- Return plain text inside each text field. No markdown, HTML, or quotation marks around the whole response.`;
}
