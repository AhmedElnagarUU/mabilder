import type { SiteContent } from "../static-site-generator/site-content";
import { trackingFields, type TrackingSettings } from "../tracking/types";

export const MIN_DESCRIPTION_LENGTH = 50;

export type SiteHealth = {
  pages: number;
  sections: number;
  pagesWithDescription: number;
  trackingConnected: number;
  trackingTotal: number;
  projects: number;
};

// A page counts when at least one of its sections is shown on the site.
function visiblePages(content: SiteContent): SiteContent["pages"] {
  return content.pages.filter((page) => page.blocks.some((block) => !block.hidden));
}

function hasLongDescription(page: SiteContent["pages"][number], content: SiteContent): boolean {
  return content.locales.every(
    (locale) => (page.meta[locale]?.description.trim().length ?? 0) >= MIN_DESCRIPTION_LENGTH,
  );
}

function countConnected(tracking: TrackingSettings): number {
  return trackingFields.filter((field) => Boolean(tracking[field])).length;
}

export function computeSiteHealth(
  content: SiteContent,
  tracking: TrackingSettings,
  projectCount: number,
): SiteHealth {
  const pages = visiblePages(content);

  return {
    pages: pages.length,
    sections: pages.reduce(
      (total, page) => total + page.blocks.filter((block) => !block.hidden).length,
      0,
    ),
    pagesWithDescription: pages.filter((page) => hasLongDescription(page, content)).length,
    trackingConnected: countConnected(tracking),
    trackingTotal: trackingFields.length,
    projects: projectCount,
  };
}
