import type { Block } from "../static-site-generator/blocks/catalog";
import { isCopySection, visibleSections } from "./section-nav";

export type RewriteScope = "section" | "page";

export type RewriteSection = {
  id: string;
  label: string;
  copy: boolean;
};

// "section": only the focused section; "page": every visible section (fact sections are shown but disabled).
export function rewriteSections(
  blocks: Block[],
  scope: RewriteScope,
  focusId: string | null,
  label: (type: string) => string,
): RewriteSection[] {
  const sections = visibleSections(blocks).filter(
    (block) => scope === "page" || block.id === focusId,
  );

  return sections.map((block) => ({
    id: block.id,
    label: label(block.type),
    copy: isCopySection(block),
  }));
}
