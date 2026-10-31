import type { BlockType } from "../blocks/catalog";
import type { BlockRenderer } from "../themes/types";

export type ImageSlot = {
  path: string;
  aspectRatio: string;
};

export type BlockDesign = {
  id: string;
  pack: string;
  category: BlockType;
  name: string;
  label: string;
  imageSlots: readonly ImageSlot[];
  render: BlockRenderer<BlockType>;
};

export type DesignPack = {
  id: string;
  name: string;
  designs: readonly BlockDesign[];
};
