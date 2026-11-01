import type { SpamReason } from "./types";

const LINK_PATTERN = /https?:|www\./i;
const DOMAIN_PATTERN = /\b[\w-]+\.(com|net|org|ru|cn|xyz|top|info|io|me|co|biz|site|online)\b/gi;
const MIN_LETTER_RATIO = 0.5;
const MIN_MESSAGE_CHARS = 8;

function domainCount(text: string): number {
  return text.match(DOMAIN_PATTERN)?.length ?? 0;
}

function hasLink(text: string): boolean {
  return LINK_PATTERN.test(text) || domainCount(text) > 1;
}

function isMostlyNonLetters(text: string, minChars: number): boolean {
  const visible = text.replace(/\s/g, "");
  const letters = visible.match(/\p{L}/gu)?.length ?? 0;

  return visible.length >= minChars && letters / visible.length < MIN_LETTER_RATIO;
}

// Content check on the text only; the duplicate check needs the database.
export function findContentSpam(input: { name: string; message?: string }): SpamReason | null {
  if (LINK_PATTERN.test(input.name) || domainCount(input.name) > 0) {
    return "name_link";
  }

  if (input.message && hasLink(input.message)) {
    return "links";
  }

  const gibberishMessage = input.message && isMostlyNonLetters(input.message, MIN_MESSAGE_CHARS);

  return isMostlyNonLetters(input.name, 1) || gibberishMessage ? "gibberish" : null;
}
