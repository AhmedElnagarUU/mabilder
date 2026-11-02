import type { BlockType } from "../blocks/catalog";
import { agenvoPack } from "./agenvo/pack";
import { arhitectPack } from "./arhitect/pack";
import { aureliaPack } from "./aurelia/pack";
import type { BlockDesign, DesignPack } from "./types";

export const designPacks: DesignPack[] = [agenvoPack, aureliaPack, arhitectPack];

export const designs: BlockDesign[] = designPacks.flatMap((pack) => pack.designs);

export function getDesign(id: string): BlockDesign | undefined {
  return designs.find((design) => design.id === id);
}

export function getDesignsForCategory(category: BlockType): BlockDesign[] {
  return designs.filter((design) => design.category === category);
}

export function getDesignByName(category: BlockType, name: string): BlockDesign {
  const design = designs.find(
    (candidate) => candidate.category === category && candidate.name === name,
  );

  if (!design) {
    throw new Error(`No design "${name}" for category "${category}".`);
  }

  return design;
}

export function getDefaultDesign(category: BlockType): BlockDesign {
  const [design] = getDesignsForCategory(category);

  if (!design) {
    throw new Error(`No design for category "${category}".`);
  }

  return design;
}

export function legacyDesignId(type: string, variant: string): string {
  return `agenvo/${type}-${variant}`;
}
