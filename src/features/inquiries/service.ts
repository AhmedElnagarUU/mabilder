import { createHash } from "node:crypto";
import { z } from "zod";
import { isUserInactive } from "../auth/inactive";
import { requireAccess } from "../billing/require-access";
import { getUserAccess } from "../billing/user-access";
import { notify } from "../notifications/service";
import { normalizePhone } from "./phone";
import {
  countInquiries,
  countOwnerInquiries,
  deleteInquiry as deleteInquiryRecord,
  findInquiry,
  findInquiryStats,
  findSiteOwnerId,
  insertInquiry,
  listInquiries,
  updateInquiry,
} from "./repository";
import { listSiteProjects, matchProjectSlug } from "./projects";
import { publishReviews } from "./reviews";
import { findContentSpam } from "./spam";
import {
  DUPLICATE_WINDOW_MS,
  MIN_FILL_MS,
  RATE_LIMIT_PER_SITE_DAY,
  RATE_LIMIT_PER_VISITOR_HOUR,
  SPAM_RETENTION_DAYS,
  VALID_RETENTION_MONTHS,
  inquiryUpdateSchema,
  quoteSchema,
  reviewSchema,
  submissionMetaSchema,
  visitSchema,
  type Inbox,
  type InquiryCounts,
  type InquiryItem,
  type InquiryKind,
  type InquiryStats,
  type QuoteInput,
  type SpamReason,
  type VisitInput,
} from "./types";
import { isVisitDayAllowed } from "./visit-day";

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export type InquiryIssue = { path: string; message: string };

export type SubmitResult =
  | { ok: true }
  | { ok: false; code: "site_not_found" | "rate_limited" }
  | { ok: false; code: "invalid_request"; errors: InquiryIssue[] };

export type OwnerResult<Value> =
  | { ok: true; value: Value }
  | { ok: false; code: "site_not_found" | "inquiry_not_found" }
  | { ok: false; code: "invalid_request"; errors: InquiryIssue[] };

function invalid(path: string, message: string): { ok: false; code: "invalid_request"; errors: InquiryIssue[] } {
  return { ok: false, code: "invalid_request", errors: [{ path, message }] };
}

function toIssues(error: z.ZodError): InquiryIssue[] {
  return error.issues.map((issue) => ({ path: issue.path.join(".") || "request", message: issue.message }));
}

// Raw IPs are never stored: only this hash, which cannot be reversed without the secret.
function hashVisitor(ip: string, siteId: string): string {
  const secret = process.env.INQUIRY_HASH_SECRET || process.env.BETTER_AUTH_SECRET || "";
  return createHash("sha256").update(`${ip}${siteId}${secret}`).digest("hex");
}

function validExpiry(from: Date): Date {
  const expiry = new Date(from);
  expiry.setMonth(expiry.getMonth() + VALID_RETENTION_MONTHS);
  return expiry;
}

function spamExpiry(from: Date): Date {
  return new Date(from.getTime() + SPAM_RETENTION_DAYS * DAY_MS);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// Empty form fields arrive as "": they mean "not filled".
function withoutEmptyValues(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== ""));
}

function isSilentDrop(meta: z.output<typeof submissionMetaSchema>): boolean {
  const honeypotFilled = (meta.website ?? "").trim() !== "";
  const tooFast = meta.elapsedMs !== undefined && meta.elapsedMs < MIN_FILL_MS;

  return honeypotFilled || tooFast;
}

type Failure = ReturnType<typeof invalid>;

type FormKind = "quote" | "visit" | "review";
// A review is stored like a message: its comment is the message, and it has no phone.
type ReviewFields = { name: string; message: string; rating: number; projectSlug?: string };
type FormFields = QuoteInput | VisitInput | ReviewFields;

type Submission =
  | { drop: true }
  | { drop: false; kind: FormKind; input: FormFields; locale: "en" | "ar" };

type FieldsResult = { success: true; data: FormFields } | { success: false; error: z.ZodError };

function parseReviewFields(fields: Record<string, unknown>): FieldsResult {
  const parsed = reviewSchema.safeParse(fields);

  if (!parsed.success) {
    return parsed;
  }

  const { comment, ...rest } = parsed.data;
  return { success: true, data: { ...rest, message: comment } };
}

function parseFields(kind: FormKind, fields: Record<string, unknown>): FieldsResult {
  if (kind === "review") {
    return parseReviewFields(fields);
  }

  return kind === "visit" ? visitSchema.safeParse(fields) : quoteSchema.safeParse(fields);
}

function parseSubmission(body: unknown, now: Date): Submission | Failure {
  if (!isPlainObject(body)) {
    return invalid("request", "Send the request as a JSON object or a form.");
  }

  const { website, elapsedMs, locale, kind, ...fields } = body;
  const meta = submissionMetaSchema.safeParse({ website, elapsedMs, locale, kind });

  if (!meta.success) {
    return { ok: false, code: "invalid_request", errors: toIssues(meta.error) };
  }

  if (isSilentDrop(meta.data)) {
    return { drop: true };
  }

  const formKind = meta.data.kind ?? "quote";
  const parsed = parseFields(formKind, withoutEmptyValues(fields));

  if (!parsed.success) {
    return { ok: false, code: "invalid_request", errors: toIssues(parsed.error) };
  }

  const formLocale = meta.data.locale ?? "en";

  if (!("phone" in parsed.data)) {
    return { drop: false, kind: formKind, input: parsed.data, locale: formLocale };
  }

  const phone = normalizePhone(parsed.data.phone);

  if (!phone) {
    return invalid("phone", "Enter a valid phone number.");
  }

  if ("preferredDay" in parsed.data && !isVisitDayAllowed(parsed.data.preferredDay, now)) {
    return invalid("preferredDay", "Choose a day from today up to 12 months ahead.");
  }

  return { drop: false, kind: formKind, input: { ...parsed.data, phone }, locale: formLocale };
}

// One review per visitor per site per day, stored spam included.
async function hasReviewedToday(siteId: string, visitorHash: string, now: Date): Promise<boolean> {
  const count = await countInquiries({
    siteId,
    visitorHash,
    kind: "review",
    createdAt: { $gte: new Date(now.getTime() - DAY_MS) },
  });

  return count > 0;
}

async function isOverRateLimit(siteId: string, visitorHash: string, now: Date): Promise<boolean> {
  const [visitorCount, siteCount] = await Promise.all([
    countInquiries({ siteId, visitorHash, createdAt: { $gte: new Date(now.getTime() - HOUR_MS) } }),
    countInquiries({ siteId, createdAt: { $gte: new Date(now.getTime() - DAY_MS) } }),
  ]);

  return visitorCount >= RATE_LIMIT_PER_VISITOR_HOUR || siteCount >= RATE_LIMIT_PER_SITE_DAY;
}

async function findSpamReason(siteId: string, input: FormFields, now: Date): Promise<SpamReason | null> {
  const contentReason = findContentSpam(input);

  if (contentReason) {
    return contentReason;
  }

  if (!("phone" in input)) {
    return null;
  }

  const recent = await countInquiries({
    siteId,
    phone: input.phone,
    createdAt: { $gte: new Date(now.getTime() - DUPLICATE_WINDOW_MS) },
  });

  return recent > 0 ? "duplicate" : null;
}

// A missing, deleted or deactivated owner's site does not exist for visitors.
async function findActiveOwnerId(siteId: string): Promise<string | null> {
  const ownerId = await findSiteOwnerId(siteId);

  if (!ownerId || (await isUserInactive(ownerId))) {
    return null;
  }

  return ownerId;
}

async function resolveProjectSlug(siteId: string, slug: string | undefined): Promise<string | undefined> {
  return slug === undefined ? undefined : matchProjectSlug(await listSiteProjects(siteId), slug);
}

// Every request is saved, even when the owner's trial ended: it is never lost.
export async function submitInquiry(
  siteId: string,
  body: unknown,
  ip: string,
  now: Date = new Date(),
): Promise<SubmitResult> {
  const ownerId = await findActiveOwnerId(siteId);

  if (!ownerId) {
    return { ok: false, code: "site_not_found" };
  }

  const submission = parseSubmission(body, now);

  if ("ok" in submission) {
    return submission;
  }

  if (submission.drop) {
    return { ok: true };
  }

  const visitorHash = hashVisitor(ip, siteId);

  const overLimit =
    (await isOverRateLimit(siteId, visitorHash, now)) ||
    (submission.kind === "review" && (await hasReviewedToday(siteId, visitorHash, now)));

  if (overLimit) {
    return { ok: false, code: "rate_limited" };
  }

  const spamReason = await findSpamReason(siteId, submission.input, now);
  const spam = spamReason !== null;

  const projectSlug = await resolveProjectSlug(siteId, submission.input.projectSlug);

  await insertInquiry({
    ...submission.input,
    kind: submission.kind,
    reviewStatus: submission.kind === "review" ? "pending" : undefined,
    projectSlug,
    siteId,
    ownerId,
    locale: submission.locale,
    spam,
    spamReason: spamReason ?? undefined,
    notified: !spam,
    visitorHash,
    expiresAt: spam ? spamExpiry(now) : validExpiry(now),
  });

  if (!spam) {
    await notify(ownerId, "inquiry_received", { name: submission.input.name, kind: submission.kind });
  }

  return { ok: true };
}

async function ownsSite(ownerId: string, siteId: string): Promise<boolean> {
  return (await findSiteOwnerId(siteId)) === ownerId;
}

export function countNewInquiries(ownerId: string): Promise<number> {
  return countOwnerInquiries(ownerId).then((counts) => counts.newCount);
}

// Read access: trial and Pro. After the trial the owner only sees how many are waiting.
async function withProjects(siteId: string, items: InquiryItem[]): Promise<InquiryItem[]> {
  if (!items.some((item) => item.projectSlug)) {
    return items;
  }

  const projects = await listSiteProjects(siteId);

  return items.map((item) => {
    const project = projects.find((candidate) => candidate.slug === item.projectSlug);
    return project ? { ...item, projectTitle: project.title, projectHref: project.href } : item;
  });
}

export async function getInbox(
  ownerId: string,
  siteId: string,
  kind?: InquiryKind,
): Promise<Inbox | null> {
  if (!(await ownsSite(ownerId, siteId))) {
    return null;
  }

  const [counts, access] = await Promise.all([countOwnerInquiries(ownerId), getUserAccess(ownerId)]);

  if (access.state === "expired") {
    return { locked: true, newCount: counts.newCount };
  }

  const items = await listInquiries(ownerId, siteId, kind);

  return { locked: false, newCount: counts.newCount, items: await withProjects(siteId, items) };
}

export async function updateInquiryState(
  ownerId: string,
  siteId: string,
  inquiryId: string,
  body: unknown,
  now: Date = new Date(),
): Promise<OwnerResult<InquiryItem>> {
  await requireAccess(ownerId);

  if (!(await ownsSite(ownerId, siteId))) {
    return { ok: false, code: "site_not_found" };
  }

  const parsed = inquiryUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return { ok: false, code: "invalid_request", errors: toIssues(parsed.error) };
  }

  const existing = await findInquiry(ownerId, siteId, inquiryId);

  if (!existing) {
    return { ok: false, code: "inquiry_not_found" };
  }

  const { status, reviewStatus, spam } = parsed.data;
  const isReview = existing.kind === "review";

  if ((isReview && status !== undefined) || (!isReview && reviewStatus !== undefined)) {
    return invalid(isReview ? "status" : "reviewStatus", "This status does not apply to this kind of request.");
  }

  const set: Record<string, unknown> = {};
  const unset: Record<string, ""> = {};

  if (status !== undefined) {
    set.status = status;
  }

  if (reviewStatus !== undefined) {
    set.reviewStatus = reviewStatus;
  }

  if (spam === true) {
    Object.assign(set, { spam: true, spamReason: "owner", expiresAt: spamExpiry(now) });
  }

  if (spam === false) {
    Object.assign(set, { spam: false, expiresAt: validExpiry(existing.createdAtDate) });
    unset.spamReason = "";
  }

  const rescuedWithoutNotice = spam === false && !existing.notified;

  if (rescuedWithoutNotice) {
    set.notified = true;
  }

  const updated = await updateInquiry(ownerId, siteId, inquiryId, { $set: set, $unset: unset });

  if (!updated) {
    return { ok: false, code: "inquiry_not_found" };
  }

  if (rescuedWithoutNotice) {
    await notify(ownerId, "inquiry_received", { name: updated.name, kind: updated.kind });
  }

  if (isReview) {
    await publishReviews(ownerId, siteId);
  }

  return { ok: true, value: updated };
}

export async function deleteInquiry(
  ownerId: string,
  siteId: string,
  inquiryId: string,
): Promise<OwnerResult<true>> {
  await requireAccess(ownerId);

  if (!(await ownsSite(ownerId, siteId))) {
    return { ok: false, code: "site_not_found" };
  }

  const existing = await findInquiry(ownerId, siteId, inquiryId);

  if (!existing || !(await deleteInquiryRecord(ownerId, siteId, inquiryId))) {
    return { ok: false, code: "inquiry_not_found" };
  }

  if (existing.kind === "review") {
    await publishReviews(ownerId, siteId);
  }

  return { ok: true, value: true };
}

// Counts only, never visitor details: this is what the admin area reads.
export function getInquiryStats(now: Date = new Date()): Promise<InquiryStats> {
  return findInquiryStats(now);
}

export function getInquiryCountsForOwner(ownerId: string): Promise<InquiryCounts> {
  return countOwnerInquiries(ownerId);
}
