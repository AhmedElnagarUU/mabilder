import { z } from "zod";
import {
  deleteGeneratedSite,
  generateSite,
} from "../static-site-generator/generate-site";
import type { ContentIssue } from "../static-site-generator/content/validate-content";
import { buildBaseContent } from "./base-content";
import { generateSiteContent } from "./generation";
import {
  createSite as createSiteRecord,
  deleteSite as deleteSiteRecord,
  getSite as getSiteRecord,
  listSites as listSiteRecords,
  saveSiteContent as saveSiteContentRecord,
  setSiteStatus,
} from "./repository";
import {
  businessBriefSchema,
  type SiteRecord,
  type SiteSummary,
} from "./types";

export type CreateSiteResult =
  | { ok: true; site: SiteRecord }
  | { ok: false; errors: ContentIssue[] };

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
  briefInput: unknown,
): Promise<CreateSiteResult> {
  const parsed = businessBriefSchema.safeParse(briefInput);

  if (!parsed.success) {
    return { ok: false, errors: toIssues(parsed.error) };
  }

  const content = buildBaseContent(parsed.data);
  const site = await createSiteRecord(parsed.data, content);

  await generateSite(site.id, content);
  return { ok: true, site };
}

export async function listSites(): Promise<SiteSummary[]> {
  return listSiteRecords();
}

export async function getSite(siteId: string): Promise<SiteRecord | null> {
  return getSiteRecord(siteId);
}

export async function deleteSite(siteId: string): Promise<boolean> {
  const removed = await deleteSiteRecord(siteId);

  if (!removed) {
    return false;
  }

  await deleteGeneratedSite(siteId);
  return true;
}

export async function saveContent(
  siteId: string,
  contentInput: unknown,
): Promise<SaveContentResult> {
  let site: SiteRecord | null;

  try {
    site = await saveSiteContentRecord(siteId, contentInput);
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
    await generateSite(site.id, site.content);
  } catch (error) {
    await setSiteStatus(site.id, "error", errorMessage(error));
    throw error;
  }

  return { ok: true, site };
}

export async function generateContent(
  siteId: string,
): Promise<SiteRecord | null> {
  const site = await getSiteRecord(siteId);

  if (!site) {
    return null;
  }

  if (!site.content) {
    throw new Error("The site has no base content.");
  }

  await setSiteStatus(siteId, "generating");

  try {
    console.log(`[generation] content start ${siteId}`);
    const content = await generateSiteContent(site.brief, site.content);

    console.log(`[generation] content ready ${siteId}`);
    await generateSite(siteId, content);

    console.log(`[generation] files written ${siteId}`);
    const saved = await saveSiteContentRecord(siteId, content);

    if (!saved) {
      await deleteGeneratedSite(siteId);
      return null;
    }

    console.log(`[generation] saved ${siteId} ${saved.status}`);
    return saved;
  } catch (error) {
    await setSiteStatus(siteId, "error", errorMessage(error));
    throw error;
  }
}
