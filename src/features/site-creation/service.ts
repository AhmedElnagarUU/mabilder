import { z } from "zod";
import {
  deleteGeneratedSite,
  generateSite,
} from "../static-site-generator/generate-site";
import { generateSiteContent } from "./build-content";
import { createGenerationModel, type GenerationModel } from "./generation/index";
import type { FetchFunction } from "./images/pexels";
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
    await generateSite(site.id, site.content);
  } catch (error) {
    await setSiteStatus(ownerId, site.id, "error", errorMessage(error));
    throw error;
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
    await generateSite(siteId, content);

    const saved = await saveSiteContentRecord(ownerId, siteId, content);

    if (!saved) {
      await deleteGeneratedSite(siteId);
      return null;
    }

    return saved;
  } catch (error) {
    await setSiteStatus(ownerId, siteId, "error", errorMessage(error));
    throw error;
  }
}
