import type { Block } from "../static-site-generator/blocks/catalog";
import {
  getDefaultDesign,
  getDesign,
  getDesignsForCategory,
} from "../static-site-generator/designs/registry";
import type { BlockDesign } from "../static-site-generator/designs/types";

export function designsForBlock(block: Block): BlockDesign[] {
  return getDesignsForCategory(block.type);
}

export function canChangeDesign(block: Block): boolean {
  return designsForBlock(block).length > 1;
}

export function currentDesignId(block: Block): string {
  const design = getDesign(block.design);

  return design && design.category === block.type
    ? design.id
    : getDefaultDesign(block.type).id;
}
