import type { Block } from "../../static-site-generator/blocks/catalog";
import type { Locale } from "../../static-site-generator/locale";
import {
  siteContentSchema,
  type Page,
  type SiteContent,
} from "../../static-site-generator/site-content";
import type { BusinessBrief } from "../types";
import { writeCopy, type CopyCall } from "./copy";
import {
  isCopyBlock,
  toModelSchema,
  writableFields,
  writableKeys,
  writableSchema,
  type Props,
} from "./copy-fields";
import type { GenerationModel } from "./index";
import type { BusinessProfile } from "./profile";
import {
  buildCopyPrompt,
  buildTranslatePrompt,
  copySystemPrompt,
  translateSystemPrompt,
} from "./prompts";
import { createSpendGuard, type SpendGuard } from "./spend-guard";

export type CopyBackground = {
  brief: BusinessBrief;
  profile?: BusinessProfile;
};

export type RewriteRequest = {
  pageId: string;
  blockIds: string[];
  instruction?: string;
};

type CopyRun = {
  model: GenerationModel;
  content: SiteContent;
  background: CopyBackground;
  guard: SpendGuard;
};

type LocalizedProps = Partial<Record<Locale, Props>>;

function findPage(content: SiteContent, pageId: string): Page {
  const page = content.pages.find((candidate) => candidate.id === pageId);

  if (!page) {
    throw new Error(`Page "${pageId}" does not exist.`);
  }

  return page;
}

function defaultProps(content: SiteContent, block: Block): Props {
  return block.props[content.defaultLocale] as Props;
}

// Generate writes every copy block and the headings of fact blocks.
function generationBlocks(content: SiteContent, page: Page): Block[] {
  return page.blocks.filter(
    (block) => writableKeys(block.type, defaultProps(content, block)).length > 0,
  );
}

// The scoped rewrite (C1) only rewrites copy blocks: fact blocks and unknown ids are ignored.
function selectCopyBlocks(page: Page, blockIds: string[]): Block[] {
  return page.blocks.filter((block) => blockIds.includes(block.id) && isCopyBlock(block));
}

// One copy call + one retry per language and page.
function callsPerPage(content: SiteContent): number {
  return content.locales.length * 2;
}

export function generationBudget(content: SiteContent): number {
  return 1 + content.pages.length * callsPerPage(content);
}

function checkBlock(content: SiteContent, block: Block): void {
  const current = defaultProps(content, block);

  if (isCopyBlock(block) && writableKeys(block.type, current).length === 0) {
    throw new Error(`Block ${block.id} has no fields the AI can write.`);
  }

  toModelSchema(writableSchema(block.type, current));
}

// Runs before the first AI call, so a broken setup costs no tokens.
export function checkBeforeGeneration(content: SiteContent): void {
  try {
    siteContentSchema.parse(content);
    content.pages.forEach((page) => page.blocks.forEach((block) => checkBlock(content, block)));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Generation pre-flight failed: ${reason}`, { cause: error });
  }
}

function writeCall(run: CopyRun, instruction: string | undefined): CopyCall {
  return {
    name: "page_copy",
    system: copySystemPrompt,
    buildPrompt: (blocks) =>
      buildCopyPrompt({
        ...run.background,
        facts: run.content.facts,
        locale: run.content.defaultLocale,
        instruction,
        blocks,
      }),
  };
}

function translateCall(run: CopyRun, locale: Locale): CopyCall {
  return {
    name: "page_translation",
    system: translateSystemPrompt,
    buildPrompt: (blocks) => buildTranslatePrompt({ facts: run.content.facts, locale, blocks }),
  };
}

function otherLocales(content: SiteContent): Locale[] {
  return content.locales.filter((locale) => locale !== content.defaultLocale);
}

// New props per block id: written in defaultLocale, then translated into the other locale.
async function writeBlocksCopy(
  run: CopyRun,
  blocks: Block[],
  instruction?: string,
): Promise<Map<string, LocalizedProps>> {
  const { content, model, guard } = run;
  const source = content.defaultLocale;
  const copies = new Map<string, LocalizedProps>();

  if (blocks.length === 0) {
    return copies;
  }

  const written = await writeCopy(
    model,
    writeCall(run, instruction),
    blocks.map((block) => ({
      block,
      current: writableFields(block.type, defaultProps(content, block)),
    })),
    source,
    guard,
  );

  for (const block of blocks) {
    copies.set(block.id, { [source]: written.get(block.id) });
  }

  for (const locale of otherLocales(content)) {
    const translated = await writeCopy(
      model,
      translateCall(run, locale),
      blocks.map((block) => ({
        block,
        current: writableFields(block.type, written.get(block.id) ?? {}),
      })),
      locale,
      guard,
    );

    for (const block of blocks) {
      copies.set(block.id, { ...copies.get(block.id), [locale]: translated.get(block.id) });
    }
  }

  return copies;
}

// Replaces only the props of the given blocks; id, variant, hidden and order stay.
function applyCopy(content: SiteContent, copies: Map<string, LocalizedProps>): SiteContent {
  return siteContentSchema.parse({
    ...content,
    pages: content.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => {
        const props = copies.get(block.id);
        return props ? { ...block, props } : block;
      }),
    })),
  });
}

// Rewrites the chosen copy blocks of one page (the C1 scoped rewrite).
export async function rewriteBlocks(
  model: GenerationModel,
  content: SiteContent,
  request: RewriteRequest,
  background: CopyBackground,
): Promise<SiteContent> {
  const blocks = selectCopyBlocks(findPage(content, request.pageId), request.blockIds);

  if (blocks.length === 0) {
    return content;
  }

  checkBeforeGeneration(content);
  const guard = createSpendGuard(callsPerPage(content));
  const copies = await writeBlocksCopy(
    { model, content, background, guard },
    blocks,
    request.instruction,
  );

  return applyCopy(content, copies);
}

// One AI call per page (plus one translation call per page), all pages concurrently.
// When one page fails for good, the guard stops the calls of the other pages.
export async function writeSiteCopy(
  model: GenerationModel,
  content: SiteContent,
  background: CopyBackground,
  guard: SpendGuard,
): Promise<SiteContent> {
  const run = { model, content, background, guard };
  const pageCopies = await Promise.all(
    content.pages.map((page) =>
      writeBlocksCopy(run, generationBlocks(content, page)).catch((error: unknown) => {
        guard.abort(error);
        throw error;
      }),
    ),
  );

  return applyCopy(content, new Map(pageCopies.flatMap((copies) => [...copies])));
}
