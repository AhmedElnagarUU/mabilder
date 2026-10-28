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

const DUPLICATE_KEY_ERROR = 11000;

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

function isDuplicateOwnerError(error: unknown): boolean {
  const duplicate = error as {
    code?: number;
    keyPattern?: Record<string, unknown>;
  };

  return (
    duplicate.code === DUPLICATE_KEY_ERROR &&
    duplicate.keyPattern?.ownerId !== undefined
  );
}

// Returns null when the owner already has a site (one website per account).
export async function createSite(
  ownerId: string,
  briefInput: unknown,
  contentInput: SiteContent,
): Promise<SiteRecord | null> {
  const brief = businessBriefSchema.parse(briefInput);
  const content = siteContentSchema.parse(contentInput);

  await connectToDatabase();

  try {
    const site = await SiteModel.create({
      ownerId,
      slug: createSlug(brief.businessName),
      brief,
      content,
      status: "draft",
      error: null,
    });

    return toRecord(site.toObject() as LeanSite);
  } catch (error) {
    if (isDuplicateOwnerError(error)) {
      return null;
    }

    throw error;
  }
}

export async function listSites(ownerId: string): Promise<SiteSummary[]> {
  await connectToDatabase();

  const sites = (await SiteModel.find({ ownerId })
    .sort({ updatedAt: -1 })
    .lean()) as unknown as LeanSite[];

  return sites.map(toSummary);
}

export async function getSite(
  ownerId: string,
  siteId: string,
): Promise<SiteRecord | null> {
  if (!isValidObjectId(siteId)) {
    return null;
  }

  await connectToDatabase();

  const site = (await SiteModel.findOne({
    _id: siteId,
    ownerId,
  }).lean()) as LeanSite | null;
  return site ? toRecord(site) : null;
}

export async function saveSiteContent(
  ownerId: string,
  siteId: string,
  contentInput: unknown,
): Promise<SiteRecord | null> {
  if (!isValidObjectId(siteId)) {
    return null;
  }

  const content = siteContentSchema.parse(contentInput);
  await connectToDatabase();

  const site = (await SiteModel.findOneAndUpdate(
    { _id: siteId, ownerId },
    { content, status: "ready", error: null },
    { returnDocument: "after" },
  ).lean()) as LeanSite | null;

  return site ? toRecord(site) : null;
}

export async function setSiteStatus(
  ownerId: string,
  siteId: string,
  status: SiteStatus,
  error: string | null = null,
): Promise<void> {
  if (!isValidObjectId(siteId)) {
    return;
  }

  await connectToDatabase();
  await SiteModel.updateOne({ _id: siteId, ownerId }, { status, error });
}

export async function deleteSite(
  ownerId: string,
  siteId: string,
): Promise<boolean> {
  if (!isValidObjectId(siteId)) {
    return false;
  }

  await connectToDatabase();

  const site = await SiteModel.findOneAndDelete({ _id: siteId, ownerId });
  return site !== null;
}

export async function upsertSeedSite(
  ownerId: string,
  slug: string,
  briefInput: unknown,
  contentInput: unknown,
): Promise<SiteRecord> {
  const brief = businessBriefSchema.parse(briefInput);
  const content = siteContentSchema.parse(contentInput);

  await connectToDatabase();

  const site = (await SiteModel.findOneAndUpdate(
    { ownerId },
    {
      $set: { brief, content, status: "ready", error: null },
      $setOnInsert: { slug },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  ).lean()) as LeanSite | null;

  if (!site) {
    throw new Error("Failed to seed the site.");
  }

  return toRecord(site);
}
