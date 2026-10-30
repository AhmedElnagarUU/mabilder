import { getBlockDefinition, type Block } from "../static-site-generator/blocks/catalog";

export type SectionNav = {
  number: number;
  total: number;
  prevId: string | null;
  nextId: string | null;
};

export function visibleSections(blocks: Block[]): Block[] {
  return blocks.filter((block) => !block.hidden);
}

// Only copy sections can be rewritten with AI; fact sections come from the business details.
export function isCopySection(block: Block): boolean {
  return getBlockDefinition(block.type)?.kind === "copy";
}

export function resolveFocusId(blocks: Block[], selectedId: string | null): string | null {
  const visible = visibleSections(blocks);
  const selected = visible.find((block) => block.id === selectedId);

  return (selected ?? visible[0])?.id ?? null;
}

export function sectionNav(blocks: Block[], focusId: string | null): SectionNav | null {
  const visible = visibleSections(blocks);
  const index = visible.findIndex((block) => block.id === focusId);

  if (index === -1) {
    return null;
  }

  return {
    number: index + 1,
    total: visible.length,
    prevId: visible[index - 1]?.id ?? null,
    nextId: visible[index + 1]?.id ?? null,
  };
}
