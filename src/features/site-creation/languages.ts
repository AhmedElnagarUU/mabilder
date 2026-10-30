import type { BusinessBrief, WebsiteLanguages } from "./types";

// New briefs carry `languages`; old ones only an optional single `locale`.
export function resolveLanguages(brief: BusinessBrief): WebsiteLanguages {
  if (brief.languages) {
    return brief.languages;
  }

  const locale = brief.locale ?? "en";
  return { locales: [locale], defaultLocale: locale };
}
