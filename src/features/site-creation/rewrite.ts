import { z } from "zod";
import { requireAccess } from "../billing/require-access";
import { getBalance, refund, spend } from "../credits/service";
import type { CreditBalance } from "../credits/types";
import { generateSite } from "../static-site-generator/generate-site";
import { renderTags } from "../tracking/render-tags";
import { createGenerationModel, type GenerationModel } from "./generation/index";
import { isCopyBlock } from "./generation/copy-fields";
import { rewriteBlocks } from "./generation/page-copy";
import { getSite, saveSiteContent } from "./repository";
import { MAX_INSTRUCTION_LENGTH } from "./rewrite-limits";
import type { SiteRecord } from "./types";

const rewriteRequestSchema = z.object({
  pageId: z.string().min(1),
  blockIds: z.array(z.string().min(1)).max(50),
  instruction: z.string().trim().max(MAX_INSTRUCTION_LENGTH).optional(),
});

export type RewriteResult =
  | { ok: true; site: SiteRecord; balance: CreditBalance }
  | { ok: false; code: "invalid_request" | "no_copy_blocks" }
  | { ok: false; code: "credits_exhausted"; nextResetAt: string | null }
  | null;

// One credit per copy block that is really rewritten; fact blocks and unknown ids do not count.
function countCopyBlocks(site: SiteRecord, pageId: string, blockIds: string[]): number | null {
  const page = site.content?.pages.find((candidate) => candidate.id === pageId);

  if (!page) {
    return null;
  }

  return page.blocks.filter((block) => blockIds.includes(block.id) && isCopyBlock(block)).length;
}

export async function rewriteContent(
  ownerId: string,
  siteId: string,
  requestInput: unknown,
  createModel: () => GenerationModel = createGenerationModel,
): Promise<RewriteResult> {
  await requireAccess(ownerId);

  const parsed = rewriteRequestSchema.safeParse(requestInput);

  if (!parsed.success) {
    return { ok: false, code: "invalid_request" };
  }

  const site = await getSite(ownerId, siteId);

  if (!site) {
    return null;
  }

  const cost = site.content ? countCopyBlocks(site, parsed.data.pageId, parsed.data.blockIds) : null;

  if (cost === null || !site.content) {
    return { ok: false, code: "invalid_request" };
  }

  if (cost === 0) {
    return { ok: false, code: "no_copy_blocks" };
  }

  const reservation = await spend(ownerId, cost, "ai_rewrite", siteId);

  if (!reservation.ok) {
    return { ok: false, code: "credits_exhausted", nextResetAt: reservation.nextResetAt };
  }

  try {
    const content = await rewriteBlocks(
      createModel(),
      site.content,
      { ...parsed.data, instruction: parsed.data.instruction || undefined },
      { brief: site.brief },
    );
    await generateSite(siteId, content, renderTags(site.tracking));

    const saved = await saveSiteContent(ownerId, siteId, content);

    if (!saved) {
      await refund(reservation.useId);
      return null;
    }

    return { ok: true, site: saved, balance: await getBalance(ownerId) };
  } catch (error) {
    await refund(reservation.useId);
    throw error;
  }
}
