import type { SiteContent } from "../../src/features/static-site-generator/content/types";

// M4 changes the content body shape: update only this helper when it does.
export function withHomeTitle(content: unknown, title: string): SiteContent {
  const copy = structuredClone(content) as SiteContent;
  copy.pages.home.hero.title = title;
  return copy;
}
