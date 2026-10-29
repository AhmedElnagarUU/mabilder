import { z } from "zod";
import {
  blockDefinitions,
  type BlockType,
} from "../../static-site-generator/blocks/catalog";
import { imageSchema, type Image } from "../../static-site-generator/blocks/common";

export type Props = Record<string, unknown>;

// One image field of a copy block: a single optional image or a list of up to `capacity` images.
export type ImageSlot = {
  type: BlockType;
  key: string;
  isList: boolean;
  capacity: number;
};

function unwrap(field: z.ZodType): z.ZodType {
  return field instanceof z.ZodOptional ? (field.unwrap() as z.ZodType) : field;
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

  return undefined;
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

export function isSlotEmpty(props: Props, slot: ImageSlot): boolean {
  const value = props[slot.key];
  return slot.isList ? !Array.isArray(value) || value.length === 0 : value === undefined;
}

export function withImages(props: Props, slot: ImageSlot, images: Image[]): Props {
  return { ...props, [slot.key]: slot.isList ? images : images[0] };
}
