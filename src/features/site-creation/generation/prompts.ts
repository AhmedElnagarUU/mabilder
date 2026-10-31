import type { Facts } from "../../static-site-generator/blocks/facts";
import type { Locale } from "../../static-site-generator/locale";
import type { PageSlug } from "../../static-site-generator/site-content";
import type { BusinessBrief } from "../types";
import type { BusinessProfile } from "./profile";

export type BlockPromptInput = {
  id: string;
  type: string;
  design: string;
  fields: object;
  current: Record<string, unknown>;
};

export type CopyPromptInput = {
  brief: BusinessBrief;
  profile?: BusinessProfile;
  facts: Facts;
  locale: Locale;
  instruction?: string;
  blocks: BlockPromptInput[];
};

export type TranslatePromptInput = {
  facts: Facts;
  locale: Locale;
  blocks: BlockPromptInput[];
};

export type SeoPromptInput = {
  brief: BusinessBrief;
  profile?: BusinessProfile;
  facts: Facts;
  locale: Locale;
  pages: Array<{ slug: PageSlug; title: string }>;
};

const languageNames: Record<Locale, string> = {
  en: "English",
  ar: "Modern Standard Arabic",
};

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
- ImageQueries has one entry per image category: "hero" (homepage banner), "intro" (craft, team, or detail), "feature-split" (a service or project at work). Each value is a concrete, visual English stock-photo search of 2-5 words, with no brand names and no person names.
- Do not invent awards, clients, numbers, credentials, dates, or personal names.`;
}

function toneHint(profile: BusinessProfile | undefined): string {
  return profile
    ? `\n- Match the brand tone (${profile.tone}) and positioning (${profile.positioning}) without adding facts.`
    : "";
}

export const copySystemPrompt = `You are a senior website copywriter. You write clear, specific website copy for one business, block by block. You never invent facts: no numbers, years, awards, clients, prices, credentials, addresses, or personal names beyond the facts you are given. Return only the requested structured data.`;

const blockOutputRules = `- Return { "blocks": { "<block id>": { …fields } } } with one entry per block id above.
- Each block's fields must follow its "fields" JSON schema, including the list lengths (minItems/maxItems) and non-empty text.
- For an optional field you leave out, return an empty string. Leave "icon" empty.`;

function formatInstruction(instruction: string | undefined): string {
  return instruction
    ? `\nCustomer instruction for this rewrite (follow it unless it asks you to invent facts):\n"""${instruction}"""\n`
    : "";
}

export function buildCopyPrompt(input: CopyPromptInput): string {
  const language = languageNames[input.locale];

  return `Write the website copy for these blocks of one page, in ${language}.

Brief:
${JSON.stringify(input.brief, null, 2)}

Business profile:
${JSON.stringify(input.profile ?? null, null, 2)}

Facts (use them exactly as written; never change them or add new ones):
${JSON.stringify(input.facts, null, 2)}

Blocks ("fields" is the JSON schema of what you write, "current" is the current text):
${JSON.stringify(input.blocks, null, 2)}
${formatInstruction(input.instruction)}
Rules:
${blockOutputRules}
- Write new text for every field. The current text is a placeholder or the previous version: do not copy it, and do not reuse its names, places, or claims.
- Write everything in ${language}. Keep the business name and every fact exactly as given.
- A contact form really sends the visitor's request to the business, which calls back. Write its success message as a true, warm confirmation (the request was received and the business will call soon). Never say it is a demo, a test, or that nothing is sent.
- Fit each block's type and design: titles are short (at most 10 words), bodies 1-3 sentences, list items concise.
- Do not invent awards, clients, numbers, credentials, dates, prices, or personal names.${toneHint(input.profile)}`;
}

export const translateSystemPrompt = `You are a professional website translator. You translate website copy naturally and keep its meaning, tone, and structure. You never add or remove information. Return only the requested structured data.`;

export function buildTranslatePrompt(input: TranslatePromptInput): string {
  const language = languageNames[input.locale];

  return `Translate the "current" text of every block into ${language}.

Facts (keep names and numbers exactly as written):
${JSON.stringify(input.facts, null, 2)}

Blocks ("fields" is the JSON schema of what you write, "current" is the text to translate):
${JSON.stringify(input.blocks, null, 2)}

Rules:
${blockOutputRules}
- Keep the same fields and the same number of list items as "current".
- Translate every text field into ${language}; keep the business name and personal names as written.`;
}

export const seoSystemPrompt = `You are a senior SEO copywriter. You write page titles and meta descriptions that are natural, specific, and true to one business. You never invent facts: no numbers, years, awards, clients, prices, credentials, addresses, or personal names beyond the facts you are given. Return only the requested structured data.`;

export function buildSeoPrompt(input: SeoPromptInput): string {
  const language = languageNames[input.locale];

  return `Write the SEO title and meta description for every page of this website, in ${language}.

Brief:
${JSON.stringify(input.brief, null, 2)}

Business profile:
${JSON.stringify(input.profile ?? null, null, 2)}

Facts (use them exactly as written; never change them or add new ones):
${JSON.stringify(input.facts, null, 2)}

Pages (slug and current title):
${JSON.stringify(input.pages, null, 2)}

Rules:
- Return { "pages": [ { "slug": "<slug>", "title": "<title>", "description": "<description>" } ] } with one entry per slug above.
- title is at most 60 characters. description is 120-160 characters.
- Write both in ${language}, natural ${language} for real readers, not keyword stuffing.
- The "index" page title is "<business name> — <main service>" (add the city only when the facts include it).
- Every other title names that page's subject; it may add the business name when it fits.
- Use only the brief, profile, and facts above. Do not invent awards, clients, numbers, credentials, dates, prices, or personal names.
- Do not copy the current title as it is unless it already fits these rules.${toneHint(input.profile)}`;
}
