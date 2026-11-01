import type { Block } from "../static-site-generator/blocks/catalog";
import {
  getDefaultDesign,
  getDesign,
  getDesignsForCategory,
} from "../static-site-generator/designs/registry";
import type { BlockDesign } from "../static-site-generator/designs/types";
import { getTemplate } from "../static-site-generator/site-templates/registry";

// Only the site template's own pack: a design from another pack has no styles in this template's shell.
export function designsForBlock(block: Block, templateId: string): BlockDesign[] {
  const pack = getTemplate(templateId).shell;

  return getDesignsForCategory(block.type).filter((design) => design.pack === pack);
}

export function canChangeDesign(block: Block, templateId: string): boolean {
  return designsForBlock(block, templateId).length > 1;
}

export function currentDesignId(block: Block): string {
  const design = getDesign(block.design);

  return design && design.category === block.type
    ? design.id
    : getDefaultDesign(block.type).id;
}
