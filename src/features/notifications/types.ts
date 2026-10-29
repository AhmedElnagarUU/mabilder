import { z } from "zod";

export const NOTIFICATION_TYPES = [
  "welcome",
  "site_ready",
  "site_failed",
  "trial_ending",
  "trial_ended",
  "payment_received",
  "payment_approved",
  "payment_rejected",
  "plan_changed",
  "feedback_received",
  "feedback_replied",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_LOCALES = ["en", "ar"] as const;

export type NotificationLocale = (typeof NOTIFICATION_LOCALES)[number];

export const EMAIL_STATUSES = ["queued", "sent", "failed"] as const;

export type EmailStatus = (typeof EMAIL_STATUSES)[number];

const shortText = z.string().min(1).max(200);

// Flat values only: never secrets, passwords or payment details.
export const notificationParamSchemas = {
  welcome: z.object({ name: shortText }),
  site_ready: z.object({ businessName: shortText }),
  site_failed: z.object({ businessName: shortText }),
  trial_ending: z.object({ daysLeft: z.number().int().min(0).max(15) }),
  trial_ended: z.object({}),
  payment_received: z.object({
    userName: shortText,
    amount: z.number().positive(),
    currency: z.string().min(1).max(10),
  }),
  payment_approved: z.object({ paidUntil: shortText }),
  payment_rejected: z.object({ note: z.string().max(500).optional() }),
  plan_changed: z.object({ plan: z.enum(["trial", "pro", "expired"]) }),
  feedback_received: z.object({ userName: shortText }),
  feedback_replied: z.object({}),
} satisfies Record<NotificationType, z.ZodType>;

export type NotificationParams = {
  [T in NotificationType]: z.output<(typeof notificationParamSchemas)[T]>;
};

export function parseParams<T extends NotificationType>(
  type: T,
  params: unknown,
): NotificationParams[T] {
  return notificationParamSchemas[type].parse(params) as NotificationParams[T];
}

export function toNotificationLocale(value: unknown): NotificationLocale {
  return NOTIFICATION_LOCALES.find((locale) => locale === value) ?? "en";
}

export const markReadSchema = z.object({
  ids: z.array(z.string().min(1)).max(100).optional(),
});

export type NotificationRecipient = {
  userId: string;
  email: string;
  locale: NotificationLocale;
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  params: Record<string, string | number>;
  readAt: string | null;
  createdAt: string;
};

export type NotificationList = {
  items: NotificationItem[];
  unreadCount: number;
};

export type QueuedEmail = {
  id: string;
  to: string;
  locale: NotificationLocale;
  type: NotificationType;
  params: unknown;
  attempts: number;
};
