import type { SiteContent } from "../static-site-generator/site-content";
import { composeSite } from "./composition/compose";
import { buildFacts } from "./facts";
import type { BusinessBrief } from "./types";

const defaultTheme = "agenvo";

// Rules only, no AI: copy blocks keep their fixture text until AI copy (M5) fills them.
export function buildSiteContent(
  brief: BusinessBrief,
  currentYear = new Date().getFullYear(),
): SiteContent {
  const locale = brief.locale ?? "en";

  return composeSite({
    theme: defaultTheme,
    locales: [locale],
    defaultLocale: locale,
    facts: buildFacts(brief),
    currentYear,
  });
}
