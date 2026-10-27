import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "../../shared/db/mongoose";
import {
  siteContentSchema,
  type SiteContent,
} from "../static-site-generator/content/types";
import { SiteModel } from "./model";
import { createSlug } from "./slug";
import {
  businessBriefSchema,
  type SiteRecord,
  type SiteStatus,
  type SiteSummary,
} from "./types";

type LeanSite = {
  _id: { toString(): string };
  slug: string;
  brief: unknown;
  content: unknown;
  status: SiteStatus;
  error?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function toSummary(site: LeanSite): SiteSummary {
  const brief = businessBriefSchema.parse(site.brief);

  return {
    id: site._id.toString(),
    slug: site.slug,
    businessName: brief.businessName,
    industry: brief.industry,
    status: site.status,
    updatedAt: site.updatedAt.toISOString(),
  };
}

function toRecord(site: LeanSite): SiteRecord {
  const brief = businessBriefSchema.parse(site.brief);
  const content =
    site.content === null || site.content === undefined
      ? null
      : siteContentSchema.parse(site.content);

  return {
    ...toSummary(site),
    brief,
    content,
    error: site.error ?? null,
    createdAt: site.createdAt.toISOString(),
  };
}

export async function createSite(
  briefInput: unknown,
  contentInput: SiteContent,
): Promise<SiteRecord> {
  const brief = businessBriefSchema.parse(briefInput);
  const content = siteContentSchema.parse(contentInput);

  await connectToDatabase();

  const site = await SiteModel.create({
    slug: createSlug(brief.businessName),
    brief,
    content,
    status: "draft",
    error: null,
  });

  return toRecord(site.toObject() as LeanSite);
}

export async function listSites(): Promise<SiteSummary[]> {
  await connectToDatabase();

  const sites = (await SiteModel.find()
    .sort({ updatedAt: -1 })
    .lean()) as unknown as LeanSite[];

  return sites.map(toSummary);
}

export async function getSite(siteId: string): Promise<SiteRecord | null> {
  if (!isValidObjectId(siteId)) {
    return null;
  }

  await connectToDatabase();

  const site = (await SiteModel.findById(siteId).lean()) as LeanSite | null;
  return site ? toRecord(site) : null;
}

export async function saveSiteContent(
  siteId: string,
  contentInput: unknown,
): Promise<SiteRecord | null> {
  if (!isValidObjectId(siteId)) {
    return null;
  }

  const content = siteContentSchema.parse(contentInput);
  await connectToDatabase();

  const site = (await SiteModel.findByIdAndUpdate(
    siteId,
    { content, status: "ready", error: null },
    { returnDocument: "after" },
  ).lean()) as LeanSite | null;

  return site ? toRecord(site) : null;
}

export async function setSiteStatus(
  siteId: string,
  status: SiteStatus,
  error: string | null = null,
): Promise<void> {
  if (!isValidObjectId(siteId)) {
    return;
  }

  await connectToDatabase();
  await SiteModel.findByIdAndUpdate(siteId, { status, error });
}

export async function deleteSite(siteId: string): Promise<boolean> {
  if (!isValidObjectId(siteId)) {
    return false;
  }

  await connectToDatabase();

  const site = await SiteModel.findByIdAndDelete(siteId);
  return site !== null;
}

export async function upsertSeedSite(
  slug: string,
  briefInput: unknown,
  contentInput: unknown,
): Promise<SiteRecord> {
  const brief = businessBriefSchema.parse(briefInput);
  const content = siteContentSchema.parse(contentInput);

  await connectToDatabase();

  const site = (await SiteModel.findOneAndUpdate(
    { slug },
    { $set: { brief, content, status: "ready", error: null } },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  ).lean()) as LeanSite | null;

  if (!site) {
    throw new Error("Failed to seed the site.");
  }

  return toRecord(site);
}
