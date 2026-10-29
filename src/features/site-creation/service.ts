import { z } from "zod";
import { notify } from "../notifications/service";
import { recordActivity, recordContentSaved } from "../activity/service";
import {
  deleteGeneratedSite,
  generateSite,
} from "../static-site-generator/generate-site";
import { renderTags } from "../tracking/render-tags";
import { generateSiteContent } from "./build-content";
import { createGenerationModel, type GenerationModel } from "./generation/index";
import type { FetchFunction } from "./images/pexels";
import {
  createSite as createSiteRecord,
  deleteSite as deleteSiteRecord,
  getSite as getSiteRecord,
  listSites as listSiteRecords,
  saveSiteContent as saveSiteContentRecord,
  saveSiteTracking as saveSiteTrackingRecord,
  setSiteStatus,
} from "./repository";
import {
  businessBriefSchema,
  type SiteRecord,
  type SiteSummary,
} from "./types";

export type ContentIssue = {
  path: string;
  message: string;
};

export type CreateSiteResult =
  | { ok: true; site: SiteRecord }
  | { ok: false; code: "invalid_request"; errors: ContentIssue[] }
  | { ok: false; code: "site_exists" };

export type SaveContentResult =
  | { ok: true; site: SiteRecord }
  | { ok: false; errors: ContentIssue[] }
  | null;

function toIssues(error: z.ZodError): ContentIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.join(".") || "content",
    message: issue.message,
  }));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error.";
}

export async function createSite(
  ownerId: string,
  briefInput: unknown,
): Promise<CreateSiteResult> {
  const parsed = businessBriefSchema.safeParse(briefInput);

  if (!parsed.success) {
    return {
      ok: false,
      code: "invalid_request",
      errors: toIssues(parsed.error),
    };
  }

  const site = await createSiteRecord(ownerId, parsed.data);

  if (!site) {
    return { ok: false, code: "site_exists" };
  }

  await recordActivity({
    userId: ownerId,
    actorId: ownerId,
    type: "site_created",
    siteId: site.id,
  });

  return { ok: true, site };
}

export async function listSites(ownerId: string): Promise<SiteSummary[]> {
  return listSiteRecords(ownerId);
}

export async function getSite(
  ownerId: string,
  siteId: string,
): Promise<SiteRecord | null> {
  return getSiteRecord(ownerId, siteId);
}

export async function deleteSite(
  ownerId: string,
  siteId: string,
): Promise<boolean> {
  const removed = await deleteSiteRecord(ownerId, siteId);

  if (!removed) {
    return false;
  }

  await deleteGeneratedSite(siteId);
  return true;
}

export async function saveContent(
  ownerId: string,
  siteId: string,
  contentInput: unknown,
): Promise<SaveContentResult> {
  let site: SiteRecord | null;

  try {
    site = await saveSiteContentRecord(ownerId, siteId, contentInput);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, errors: toIssues(error) };
    }

    throw error;
  }

  if (!site) {
    return null;
  }

  if (!site.content) {
    throw new Error("The site has no content.");
  }

  try {
    await generateSite(site.id, site.content, renderTags(site.tracking));
  } catch (error) {
    await setSiteStatus(ownerId, site.id, "error", errorMessage(error));
    throw error;
  }

  await recordContentSaved(ownerId, site.id);

  return { ok: true, site };
}

export async function saveTracking(
  ownerId: string,
  siteId: string,
  trackingInput: unknown,
): Promise<SaveContentResult> {
  let site: SiteRecord | null;

  try {
    site = await saveSiteTrackingRecord(ownerId, siteId, trackingInput);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { ok: false, errors: toIssues(error) };
    }

    throw error;
  }

  if (!site) {
    return null;
  }

  if (site.content) {
    await generateSite(site.id, site.content, renderTags(site.tracking));
  }

  return { ok: true, site };
}

export async function generateContent(
  ownerId: string,
  siteId: string,
  createModel: () => GenerationModel = createGenerationModel,
  fetchFunction: FetchFunction = fetch,
): Promise<SiteRecord | null> {
  const site = await getSiteRecord(ownerId, siteId);

  if (!site) {
    return null;
  }

  await setSiteStatus(ownerId, siteId, "generating");

  try {
    const content = await generateSiteContent(
      createModel(),
      site.brief,
      site.content,
      fetchFunction,
    );
    await generateSite(siteId, content, renderTags(site.tracking));

    const saved = await saveSiteContentRecord(ownerId, siteId, content);

    if (!saved) {
      await deleteGeneratedSite(siteId);
      return null;
    }

    await recordActivity({
      userId: ownerId,
      actorId: ownerId,
      type: "site_generated",
      siteId,
    });
    await notify(ownerId, "site_ready", { businessName: saved.brief.businessName });

    return saved;
  } catch (error) {
    await setSiteStatus(ownerId, siteId, "error", errorMessage(error));
    await recordActivity({
      userId: ownerId,
      actorId: ownerId,
      type: "site_generation_failed",
      siteId,
    });
    await notify(ownerId, "site_failed", { businessName: site.brief.businessName });
    throw error;
  }
}
