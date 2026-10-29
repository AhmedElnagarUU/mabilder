import type { SiteContent } from "../static-site-generator/site-content";
import { composeSite } from "./composition/compose";
import { buildFacts } from "./facts";
import type { GenerationModel } from "./generation/index";
import {
  checkBeforeGeneration,
  generationBudget,
  writeSiteCopy,
} from "./generation/page-copy";
import { normalizeBusinessProfile } from "./generation/profile";
import { createSpendGuard } from "./generation/spend-guard";
import type { BusinessBrief } from "./types";

const defaultTheme = "agenvo";

// Rules only, no AI: copy blocks keep their fixture text.
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

// Regenerate starts from the current content, so ids, variants, hidden flags, order and
// images stay; only the copy is written again.
export async function generateSiteContent(
  model: GenerationModel,
  brief: BusinessBrief,
  current: SiteContent | null,
): Promise<SiteContent> {
  const content = current ?? buildSiteContent(brief);
  checkBeforeGeneration(content);

  const guard = createSpendGuard(generationBudget(content));
  const profile = await normalizeBusinessProfile(model, brief, guard);
  return writeSiteCopy(model, content, { brief, profile }, guard);
}
