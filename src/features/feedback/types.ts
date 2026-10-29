import { z } from "zod";

export const FEEDBACK_STATUSES = ["new", "read", "resolved"] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export const FEEDBACK_PAGE_SIZE = 25;

export const MAX_FEEDBACK_MESSAGE_LENGTH = 2000;

export const sendFeedbackSchema = z.object({
  message: z.string().trim().min(1).max(MAX_FEEDBACK_MESSAGE_LENGTH),
  rating: z.number().int().min(1).max(5).optional(),
  page: z.string().max(200).optional(),
});

export type SendFeedbackInput = z.output<typeof sendFeedbackSchema>;

export const replyFeedbackSchema = z.object({
  reply: z.string().trim().min(1).max(MAX_FEEDBACK_MESSAGE_LENGTH),
});

export const setFeedbackStatusSchema = z.object({
  status: z.enum(FEEDBACK_STATUSES),
});

// Lenient like the admin user list: a bad filter in the URL falls back to the default.
export const feedbackListQuerySchema = z.object({
  status: z.enum(FEEDBACK_STATUSES).optional().catch(undefined),
  page: z.coerce.number().int().min(1).catch(1),
});

export type FeedbackListQuery = z.output<typeof feedbackListQuerySchema>;

export type FeedbackRow = {
  id: string;
  userId: string;
  message: string;
  rating: number | null;
  page: string | null;
  status: FeedbackStatus;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
};

export type FeedbackEntry = FeedbackRow & {
  userName: string;
  userEmail: string;
};

export type FeedbackPage = {
  items: FeedbackEntry[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type FeedbackChangeResult = "ok" | "not_found";
