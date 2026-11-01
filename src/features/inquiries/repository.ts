import mongoose, { isValidObjectId, type QueryFilter } from "mongoose";
import { connectToDatabase } from "../../shared/db/mongoose";
import { InquiryModel, type InquiryDocument } from "./model";
import {
  LIST_LIMIT,
  type InquiryCounts,
  type InquiryItem,
  type InquiryKind,
  type InquiryStats,
  type SpamReason,
} from "./types";

type LeanInquiry = InquiryDocument & { _id: { toString(): string }; createdAt: Date };

export type NewInquiry = Pick<
  InquiryItem,
  | "kind"
  | "name"
  | "email"
  | "message"
  | "service"
  | "location"
  | "area"
  | "budget"
  | "startWhen"
  | "preferredDay"
  | "preferredTime"
  | "projectSlug"
  | "rating"
  | "reviewStatus"
  | "locale"
  | "spam"
  | "spamReason"
> & {
  phone?: string;
  siteId: string;
  ownerId: string;
  notified: boolean;
  visitorHash: string;
  expiresAt: Date;
};

function toItem(document: LeanInquiry): InquiryItem {
  return {
    id: document._id.toString(),
    kind: document.kind,
    name: document.name,
    phone: document.phone ?? "",
    email: document.email ?? undefined,
    message: document.message ?? undefined,
    service: document.service ?? undefined,
    location: document.location ?? undefined,
    area: document.area ?? undefined,
    budget: document.budget ?? undefined,
    startWhen: document.startWhen ?? undefined,
    preferredDay: document.preferredDay ?? undefined,
    preferredTime: document.preferredTime ?? undefined,
    projectSlug: document.projectSlug ?? undefined,
    rating: document.rating ?? undefined,
    reviewStatus: document.reviewStatus ?? undefined,
    locale: document.locale as "en" | "ar",
    status: document.status,
    spam: document.spam,
    spamReason: document.spamReason ?? undefined,
    createdAt: document.createdAt.toISOString(),
  };
}

// The `sites` collection belongs to site-creation; only the owner id is read, without its model.
export async function findSiteOwnerId(siteId: string): Promise<string | null> {
  if (!isValidObjectId(siteId)) {
    return null;
  }

  const mongo = await connectToDatabase();
  const site = await mongo.connection
    .collection("sites")
    .findOne({ _id: new mongoose.Types.ObjectId(siteId) }, { projection: { ownerId: 1 } });

  return typeof site?.ownerId === "string" ? site.ownerId : null;
}

// The stored website content, as saved by site-creation. Validated by the caller.
export async function findSiteContent(siteId: string): Promise<unknown> {
  if (!isValidObjectId(siteId)) {
    return null;
  }

  const mongo = await connectToDatabase();
  const site = await mongo.connection
    .collection("sites")
    .findOne({ _id: new mongoose.Types.ObjectId(siteId) }, { projection: { content: 1 } });

  return site?.content ?? null;
}

export async function insertInquiry(input: NewInquiry): Promise<void> {
  await connectToDatabase();
  await InquiryModel.create(input);
}

export async function countInquiries(filter: QueryFilter<InquiryDocument>): Promise<number> {
  await connectToDatabase();
  return InquiryModel.countDocuments(filter);
}

export async function listInquiries(
  ownerId: string,
  siteId: string,
  kind?: InquiryKind,
): Promise<InquiryItem[]> {
  await connectToDatabase();

  const documents = (await InquiryModel.find(kind ? { ownerId, siteId, kind } : { ownerId, siteId })
    .sort({ createdAt: -1 })
    .limit(LIST_LIMIT)
    .lean()) as unknown as LeanInquiry[];

  return documents.map(toItem);
}

export async function listApprovedReviews(
  siteId: string,
): Promise<{ name: string; rating: number; comment: string }[]> {
  await connectToDatabase();

  const documents = (await InquiryModel.find({
    siteId,
    kind: "review",
    reviewStatus: "approved",
    spam: false,
  })
    .sort({ createdAt: -1 })
    .limit(LIST_LIMIT)
    .lean()) as unknown as LeanInquiry[];

  return documents.flatMap((document) =>
    document.rating && document.message
      ? [{ name: document.name, rating: document.rating, comment: document.message }]
      : [],
  );
}

export async function findInquiry(
  ownerId: string,
  siteId: string,
  inquiryId: string,
): Promise<(InquiryItem & { notified: boolean; createdAtDate: Date }) | null> {
  if (!isValidObjectId(inquiryId)) {
    return null;
  }

  await connectToDatabase();

  const document = (await InquiryModel.findOne({
    _id: inquiryId,
    ownerId,
    siteId,
  }).lean()) as unknown as (LeanInquiry & { notified: boolean }) | null;

  return document
    ? { ...toItem(document), notified: document.notified, createdAtDate: document.createdAt }
    : null;
}

export async function updateInquiry(
  ownerId: string,
  siteId: string,
  inquiryId: string,
  update: Record<string, unknown>,
): Promise<InquiryItem | null> {
  await connectToDatabase();

  const updated = (await InquiryModel.findOneAndUpdate(
    { _id: inquiryId, ownerId, siteId },
    update,
    { returnDocument: "after" },
  ).lean()) as unknown as LeanInquiry | null;

  return updated ? toItem(updated) : null;
}

export async function deleteInquiry(
  ownerId: string,
  siteId: string,
  inquiryId: string,
): Promise<boolean> {
  if (!isValidObjectId(inquiryId)) {
    return false;
  }

  await connectToDatabase();

  const deleted = await InquiryModel.findOneAndDelete({ _id: inquiryId, ownerId, siteId });
  return deleted !== null;
}

export async function countOwnerInquiries(ownerId: string): Promise<InquiryCounts> {
  const [total, spam, newCount] = await Promise.all([
    countInquiries({ ownerId }),
    countInquiries({ ownerId, spam: true }),
    countInquiries({
      ownerId,
      spam: false,
      $or: [
        { kind: { $ne: "review" }, status: "new" },
        { kind: "review", reviewStatus: "pending" },
      ],
    }),
  ]);

  return { total, valid: total - spam, spam, newCount };
}

export async function findInquiryStats(now: Date): Promise<InquiryStats> {
  await connectToDatabase();

  const since = (days: number) => ({ createdAt: { $gte: new Date(now.getTime() - days * 86_400_000) } });
  const [total, today, last7Days, last30Days, spam, reasons, sites] = await Promise.all([
    InquiryModel.countDocuments({}),
    InquiryModel.countDocuments(since(1)),
    InquiryModel.countDocuments(since(7)),
    InquiryModel.countDocuments(since(30)),
    InquiryModel.countDocuments({ spam: true }),
    InquiryModel.aggregate<{ _id: SpamReason; count: number }>([
      { $match: { spam: true, spamReason: { $exists: true } } },
      { $group: { _id: "$spamReason", count: { $sum: 1 } } },
    ]),
    InquiryModel.aggregate<{ _id: { siteId: string; ownerId: string }; count: number }>([
      { $match: { spam: false } },
      { $group: { _id: { siteId: "$siteId", ownerId: "$ownerId" }, count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return {
    total,
    today,
    last7Days,
    last30Days,
    valid: total - spam,
    spam,
    spamReasons: Object.fromEntries(reasons.map((row) => [row._id, row.count])),
    topSites: sites.map((row) => ({ ...row._id, count: row.count })),
  };
}
