import { z } from "zod";
import { budgetKeys, startKeys } from "../static-site-generator/blocks/contact-options";
import { localeSchema } from "../static-site-generator/locale";

export const inquiryKinds = ["quote", "visit", "review"] as const;
export const inquiryStatuses = ["new", "contacted", "won", "lost"] as const;
export const spamReasons = ["links", "name_link", "gibberish", "duplicate", "owner"] as const;
export const preferredTimes = ["morning", "evening"] as const;

export type InquiryKind = (typeof inquiryKinds)[number];
export type InquiryStatus = (typeof inquiryStatuses)[number];
export type SpamReason = (typeof spamReasons)[number];

export const RATE_LIMIT_PER_VISITOR_HOUR = 5;
export const RATE_LIMIT_PER_SITE_DAY = 200;
export const MIN_FILL_MS = 3000;
export const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
export const SPAM_RETENTION_DAYS = 30;
export const VALID_RETENTION_MONTHS = 12;
export const LIST_LIMIT = 300;

const optionalText = (max: number) => z.string().trim().min(1).max(max).optional();

// The fields a visitor can send. Anything else is rejected.
export const quoteSchema = z
  .object({
    name: z.string().trim().min(1).max(80),
    phone: z.string().trim().min(7).max(20),
    email: z.string().trim().email().max(120).optional(),
    message: optionalText(2000),
    service: optionalText(200),
    location: optionalText(120),
    area: optionalText(40),
    budget: z.enum(budgetKeys).optional(),
    startWhen: z.enum(startKeys).optional(),
  })
  .strict();

export type QuoteInput = z.infer<typeof quoteSchema>;

// Sent by the form next to the fields, never stored: honeypot, fill time, page language.
export const submissionMetaSchema = z.object({
  website: z.string().optional(),
  elapsedMs: z.coerce.number().optional(),
  locale: localeSchema.optional().catch(undefined),
  kind: z.literal("quote").optional(),
});

export const inquiryUpdateSchema = z
  .object({
    status: z.enum(inquiryStatuses).optional(),
    spam: z.boolean().optional(),
  })
  .strict()
  .refine((value) => value.status !== undefined || value.spam !== undefined, {
    message: "Send a status or a spam flag.",
  });

export type InquiryUpdate = z.infer<typeof inquiryUpdateSchema>;

export type InquiryItem = {
  id: string;
  kind: InquiryKind;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  service?: string;
  location?: string;
  area?: string;
  budget?: (typeof budgetKeys)[number];
  startWhen?: (typeof startKeys)[number];
  locale: "en" | "ar";
  status: InquiryStatus;
  spam: boolean;
  spamReason?: SpamReason;
  createdAt: string;
};

export type Inbox =
  | { locked: true; newCount: number }
  | { locked: false; newCount: number; items: InquiryItem[] };

export type InquiryCounts = {
  total: number;
  valid: number;
  spam: number;
  newCount: number;
};

export type InquiryStats = {
  total: number;
  today: number;
  last7Days: number;
  last30Days: number;
  valid: number;
  spam: number;
  spamReasons: Partial<Record<SpamReason, number>>;
  topSites: { siteId: string; ownerId: string; count: number }[];
};
