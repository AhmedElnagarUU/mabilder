import { z } from "zod";
import {
  blockDefinitions,
  type BlockType,
} from "../../static-site-generator/blocks/catalog";
import { imageSchema, type Image } from "../../static-site-generator/blocks/common";

export type Props = Record<string, unknown>;

// One image field of a copy block: a single optional image, a list of up to `capacity` images,
// or (itemKey set) one optional image on every list item. Slots belong to the block type, never
// to a design: every design of the type reads a subset of them.
export type ImageSlot = {
  type: BlockType;
  key: string;
  itemKey?: string;
  isList: boolean;
  capacity: number;
};

function unwrap(field: z.ZodType): z.ZodType {
  return field instanceof z.ZodOptional ? (field.unwrap() as z.ZodType) : field;
}

function toItemSlot(type: BlockType, key: string, list: z.ZodArray): ImageSlot | undefined {
  const element = list.element;

  if (!(element instanceof z.ZodObject)) {
    return undefined;
  }

  const image = (element.shape as Record<string, z.ZodType | undefined>).image;

  if (!image || unwrap(image) !== imageSchema) {
    return undefined;
  }

  return { type, key, itemKey: "image", isList: true, capacity: 1 };
}

function toSlot(type: BlockType, key: string, field: z.ZodType): ImageSlot | undefined {
  const inner = unwrap(field);

  if (inner === imageSchema) {
    return { type, key, isList: false, capacity: 1 };
  }

  if (inner instanceof z.ZodArray && inner.element === imageSchema) {
    const maximum = Number(inner._zod.bag.maximum);
    return { type, key, isList: true, capacity: Number.isFinite(maximum) ? maximum : 1 };
  }

  return inner instanceof z.ZodArray ? toItemSlot(type, key, inner) : undefined;
}

// Derived from the catalog schemas: only copy blocks, never fact blocks.
export function listImageSlots(): ImageSlot[] {
  return blockDefinitions.flatMap((definition) => {
    if (definition.kind !== "copy") {
      return [];
    }

    const shape = (definition.schema as unknown as z.ZodObject<z.ZodRawShape>).shape;

    return Object.entries(shape).flatMap(([key, field]) => {
      const slot = toSlot(definition.type, key, field as z.ZodType);
      return slot ? [slot] : [];
    });
  });
}

// The image needs of one block type, listed once for all its designs.
export function imageNeedsOf(type: BlockType): ImageSlot[] {
  return listImageSlots().filter((slot) => slot.type === type);
}

// Same notation as the designs' `imageSlots` paths: "image", "images", "items[].image".
export function slotPath(slot: ImageSlot): string {
  return slot.itemKey ? `${slot.key}[].${slot.itemKey}` : slot.key;
}

export function isSlotEmpty(props: Props, slot: ImageSlot): boolean {
  const value = props[slot.key];
  return slot.isList ? !Array.isArray(value) || value.length === 0 : value === undefined;
}

export function withImages(props: Props, slot: ImageSlot, images: Image[]): Props {
  return { ...props, [slot.key]: slot.isList ? images : images[0] };
}
