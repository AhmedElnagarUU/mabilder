import {
  getBlockDefinition,
  type Block,
  type BlockType,
} from "../../static-site-generator/blocks/catalog";
import type { Image } from "../../static-site-generator/blocks/common";
import type { Locale } from "../../static-site-generator/locale";
import {
  siteContentSchema,
  type SiteContent,
} from "../../static-site-generator/site-content";
import type { BusinessProfile } from "../generation/profile";
import { splitList } from "../text";
import type { BusinessBrief } from "../types";
import {
  searchPhotos,
  type FetchFunction,
  type PhotoSize,
  type StockPhoto,
} from "./pexels";
import {
  isSlotEmpty,
  listImageSlots,
  withImages,
  type ImageSlot,
  type Props,
} from "./slots";

export type ImageBackground = {
  brief: BusinessBrief;
  profile?: BusinessProfile;
};

type SlotNeed = { block: Block; slot: ImageSlot };

type Assignment = { slot: ImageSlot; photos: StockPhoto[] };

const searchSize = 15;

const blockPurposes: Partial<Record<BlockType, { purpose: string; size: PhotoSize }>> = {
  hero: { purpose: "wide professional", size: "large2x" },
  intro: { purpose: "craft detail", size: "large" },
  "feature-split": { purpose: "at work", size: "large" },
};

// A block without image falls back to this variant (see composition); with an image it goes back to the default one.
const imagelessVariants: Partial<Record<BlockType, string>> = {
  hero: "text-only",
  intro: "quote",
};

function purposeOf(type: BlockType) {
  return blockPurposes[type] ?? { purpose: "", size: "large" as PhotoSize };
}

function propsOf(content: SiteContent, block: Block, locale: Locale = content.defaultLocale): Props {
  return block.props[locale] as Props;
}

function findNeeds(content: SiteContent): SlotNeed[] {
  const slots = listImageSlots();

  return content.pages
    .flatMap((page) => page.blocks)
    .flatMap((block) =>
      slots
        .filter((slot) => slot.type === block.type)
        .filter((slot) => isSlotEmpty(propsOf(content, block), slot))
        .map((slot) => ({ block, slot })),
    );
}

function groupBySlotType(needs: SlotNeed[]): SlotNeed[][] {
  const groups = new Map<string, SlotNeed[]>();

  for (const need of needs) {
    const name = `${need.slot.type}.${need.slot.key}`;
    groups.set(name, [...(groups.get(name) ?? []), need]);
  }

  return [...groups.values()];
}

function buildQuery(type: BlockType, background: ImageBackground): string {
  const { brief, profile } = background;
  const keyword = profile?.keywords[0] ?? splitList(brief.services)[0] ?? "";

  return [brief.industry, purposeOf(type).purpose, keyword]
    .filter((part) => part.trim() !== "")
    .join(" ");
}

function isUsable(photo: StockPhoto): boolean {
  return photo.photographer.trim() !== "";
}

// Takes unused photos for every empty slot of the group; a photo id is never used twice per site.
function assignPhotos(group: SlotNeed[], found: StockPhoto[], used: Set<number>): Map<Block, Assignment> {
  const assignments = new Map<Block, Assignment>();

  for (const { block, slot } of group) {
    const photos = found
      .filter((photo) => isUsable(photo) && !used.has(photo.id))
      .slice(0, slot.capacity);
    photos.forEach((photo) => used.add(photo.id));

    if (photos.length > 0) {
      assignments.set(block, { slot, photos });
    }
  }

  return assignments;
}

function toImage(photo: StockPhoto, size: PhotoSize, alt: string): Image {
  return {
    src: photo.src[size],
    alt,
    credit: { name: photo.photographer.trim(), url: photo.url },
  };
}

// Pexels alt text is English; other languages use the business name.
function altText(photo: StockPhoto, locale: Locale, businessName: string): string {
  const alt = photo.alt?.trim();
  return locale === "en" && alt ? alt : businessName;
}

function fillBlock(content: SiteContent, block: Block, assignment: Assignment): Block {
  const { slot, photos } = assignment;
  const { size } = purposeOf(block.type);
  const props = { ...block.props } as Partial<Record<Locale, Props>>;

  for (const locale of content.locales) {
    const current = propsOf(content, block, locale);

    if (isSlotEmpty(current, slot)) {
      const images = photos.map((photo) =>
        toImage(photo, size, altText(photo, locale, content.facts.businessName)),
      );
      props[locale] = withImages(current, slot, images);
    }
  }

  const imageless = imagelessVariants[block.type];
  const variant =
    block.variant === imageless ? getBlockDefinition(block.type)?.variants[0] : block.variant;

  return { ...block, variant, props } as Block;
}

function applyAssignments(content: SiteContent, assignments: Map<Block, Assignment>): SiteContent {
  return siteContentSchema.parse({
    ...content,
    pages: content.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        const assignment = assignments.get(block);
        return assignment ? fillBlock(content, block, assignment) : block;
      }),
    })),
  });
}

// Images are optional: a failed search is logged once and leaves its slots empty.
async function searchGroup(
  group: SlotNeed[],
  background: ImageBackground,
  fetchFunction: FetchFunction,
  logFailure: (error: unknown) => void,
): Promise<StockPhoto[]> {
  const count = Math.max(searchSize, group.reduce((sum, need) => sum + need.slot.capacity, 0));

  try {
    return await searchPhotos(buildQuery(group[0].slot.type, background), count, fetchFunction);
  } catch (error) {
    logFailure(error);
    return [];
  }
}

// Fills only empty image slots of copy blocks, one Pexels search per slot type.
export async function fillImages(
  content: SiteContent,
  background: ImageBackground,
  fetchFunction: FetchFunction = fetch,
): Promise<SiteContent> {
  const groups = groupBySlotType(findNeeds(content));
  const assignments = new Map<Block, Assignment>();
  const used = new Set<number>();
  let logged = false;

  const logFailure = (error: unknown) => {
    if (!logged) {
      logged = true;
      console.error("Stock images skipped.", error instanceof Error ? error.message : "Unknown error.");
    }
  };

  for (const group of groups) {
    const found = await searchGroup(group, background, fetchFunction, logFailure);

    for (const [block, assignment] of assignPhotos(group, found, used)) {
      assignments.set(block, assignment);
    }
  }

  return groups.length === 0 ? content : applyAssignments(content, assignments);
}
