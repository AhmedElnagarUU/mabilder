import { getBlockDefinition } from "../static-site-generator/blocks/catalog";
import type { Facts } from "../static-site-generator/blocks/facts";
import {
  siteContentSchema,
  type Page,
  type SiteContent,
} from "../static-site-generator/site-content";
import { composeSite } from "./composition/compose";
import { buildFacts } from "./facts";
import type { BusinessBrief } from "./types";

type Block = Page["blocks"][number];

function isFactBlock(block: Block): boolean {
  return getBlockDefinition(block.type)?.kind === "fact";
}

// Fact blocks take their props from the fresh composition; a fact block the facts no
// longer need is dropped. Copy blocks are never touched.
function refreshExistingBlocks(current: Block[], fresh: Block[]): Block[] {
  const freshById = new Map(fresh.map((block) => [block.id, block]));

  return current.flatMap((block) => {
    if (!isFactBlock(block)) {
      return [block];
    }

    const replacement = freshById.get(block.id);
    return replacement ? [{ ...block, props: replacement.props } as Block] : [];
  });
}

// A fact block the facts newly need goes right after the block that precedes it in the recipe.
function addNewBlocks(blocks: Block[], fresh: Block[]): Block[] {
  const result = [...blocks];

  fresh.forEach((block, index) => {
    if (result.some((existing) => existing.id === block.id)) {
      return;
    }

    const previousId = fresh[index - 1]?.id;
    const previousIndex = result.findIndex((existing) => existing.id === previousId);
    result.splice(previousIndex + 1, 0, block);
  });

  return result;
}

function refreshPage(current: Page | undefined, fresh: Page): Page {
  if (!current) {
    return fresh;
  }

  return { ...current, blocks: addNewBlocks(refreshExistingBlocks(current.blocks, fresh.blocks), fresh.blocks) };
}

function hasSameSlugs(first: SiteContent, second: SiteContent): boolean {
  const slugs = (content: SiteContent) => content.pages.map((page) => page.slug).join();
  return slugs(first) === slugs(second);
}

// Facts come from code, never from AI: rebuild them from the brief and the owner's
// projects and refresh only the fact blocks. Ids, order, hidden flags, copy and images stay.
export function refreshFactBlocks(
  content: SiteContent,
  brief: BusinessBrief,
  projects: Facts["projects"],
  currentYear = new Date().getFullYear(),
): SiteContent {
  const fresh = composeSite({
    theme: content.theme,
    locales: content.locales,
    defaultLocale: content.defaultLocale,
    facts: buildFacts(brief, projects),
    currentYear,
  });
  const currentPages = new Map(content.pages.map((page) => [page.id, page]));

  return siteContentSchema.parse({
    ...content,
    facts: fresh.facts,
    nav: hasSameSlugs(content, fresh) ? content.nav : fresh.nav,
    pages: fresh.pages.map((page) => refreshPage(currentPages.get(page.id), page)),
  });
}
