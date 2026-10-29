import { z } from "zod";

export const ACTIVITY_TYPES = [
  "signed_up",
  "signed_in",
  "site_created",
  "site_generated",
  "site_generation_failed",
  "content_saved",
  "payment_submitted",
  "payment_approved",
  "payment_rejected",
  "plan_changed",
  "account_deactivated",
  "account_activated",
  "feedback_sent",
  "feedback_replied",
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

const MAX_META_KEYS = 10;
const MAX_META_TEXT_LENGTH = 200;

// Small flat values only: never secrets, passwords, brief text or payment details.
const activityMetaSchema = z
  .record(
    z.string().max(40),
    z.union([z.string().max(MAX_META_TEXT_LENGTH), z.number(), z.boolean()]),
  )
  .refine((meta) => Object.keys(meta).length <= MAX_META_KEYS);

export const activityEventSchema = z.object({
  userId: z.string().min(1),
  actorId: z.string().min(1),
  type: z.enum(ACTIVITY_TYPES),
  siteId: z.string().min(1).optional(),
  meta: activityMetaSchema.default({}),
});

export type ActivityEventInput = z.input<typeof activityEventSchema>;
export type ActivityEvent = z.output<typeof activityEventSchema>;

export type ActivityItem = {
  id: string;
  type: ActivityType;
  createdAt: string;
};
