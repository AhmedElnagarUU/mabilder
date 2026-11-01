import type { Block } from "../../static-site-generator/blocks/catalog";
import type { Locale } from "../../static-site-generator/locale";
import { siteContentSchema, type SiteContent } from "../../static-site-generator/site-content";
import type { ImageBackground } from "./fill-images";
import { searchPhotos, type FetchFunction, type StockPhoto } from "./pexels";
import { listImageSlots, type ImageSlot, type Props } from "./slots";
import { isUsable, toImage } from "./stock-image";

type Item = Props & { title?: string; image?: unknown };

const searchSize = 15;

function itemsOf(block: Block, slot: ImageSlot, locale: Locale): Item[] {
  const items = (block.props[locale] as Props | undefined)?.[slot.key];
  return Array.isArray(items) ? (items as Item[]) : [];
}

// Pexels works best with English; the English copy is the search text when the site has it.
function searchLocale(content: SiteContent): Locale {
  return content.locales.includes("en") ? "en" : content.defaultLocale;
}

function needsImage(content: SiteContent, block: Block, slot: ImageSlot, index: number): boolean {
  return content.locales.some((locale) => {
    const item = itemsOf(block, slot, locale)[index];
    return item !== undefined && item.image === undefined;
  });
}

function withItemImage(block: Block, slot: ImageSlot, index: number, photo: StockPhoto, locales: Locale[]): Block {
  const props = { ...block.props } as Partial<Record<Locale, Props>>;

  for (const locale of locales) {
    const items = itemsOf(block, slot, locale);
    const item = items[index];

    if (item !== undefined && item.image === undefined) {
      const image = toImage(photo, "large", String(item.title));
      props[locale] = {
        ...(props[locale] as Props),
        [slot.key]: items.map((candidate, position) =>
          position === index ? { ...candidate, image } : candidate,
        ),
      };
    }
  }

  return { ...block, props } as Block;
}

// Fills the optional image of each list item (a service) with one Pexels search per item title.
// A photo id is never used twice per site; a failed search stops the rest and leaves items without image.
export async function fillItemImages(
  content: SiteContent,
  background: ImageBackground,
  fetchFunction: FetchFunction,
  used: Set<number>,
  logFailure: (error: unknown) => void,
): Promise<SiteContent> {
  const slots = listImageSlots().filter((slot) => slot.itemKey !== undefined);
  const results = new Map<string, StockPhoto[]>();
  const queryLocale = searchLocale(content);
  let failed = false;

  async function findPhoto(query: string): Promise<StockPhoto | undefined> {
    if (!results.has(query) && !failed) {
      try {
        results.set(query, await searchPhotos(query, searchSize, fetchFunction));
      } catch (error) {
        failed = true;
        logFailure(error);
      }
    }

    const photo = results.get(query)?.find((candidate) => isUsable(candidate) && !used.has(candidate.id));

    if (photo) {
      used.add(photo.id);
    }

    return photo;
  }

  async function fillBlock(block: Block): Promise<Block> {
    let filled = block;

    for (const slot of slots.filter((candidate) => candidate.type === block.type)) {
      const titles = itemsOf(block, slot, queryLocale);

      for (const [index, item] of titles.entries()) {
        if (!needsImage(content, block, slot, index)) {
          continue;
        }

        const query = [background.brief.industry, item.title].filter(Boolean).join(" ");
        const photo = await findPhoto(query);

        if (photo) {
          filled = withItemImage(filled, slot, index, photo, content.locales);
        }
      }
    }

    return filled;
  }

  const pages = [];
  let changed = false;

  for (const page of content.pages) {
    const blocks = [];

    for (const block of page.blocks) {
      const filled = await fillBlock(block);
      changed = changed || filled !== block;
      blocks.push(filled);
    }

    pages.push({ ...page, blocks });
  }

  return changed ? siteContentSchema.parse({ ...content, pages }) : content;
}
