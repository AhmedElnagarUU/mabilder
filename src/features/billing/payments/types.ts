import { z } from "zod";

export const PAYMENT_METHODS = ["vodafone_cash", "instapay", "other_wallet"] as const;
export const PAYMENT_STATUSES = ["pending", "approved", "rejected"] as const;
export const PAYMENT_CURRENCY = "EGP";

export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

const egyptianMobile = z
  .string()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^01\d{9}$/));

function isOwnImageUrl(url: string): boolean {
  const base = process.env.S3_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "");
  return Boolean(base) && url.startsWith(`${base}/`);
}

// The amount is never read from the client: the server stores the Pro price itself.
export const submitPaymentSchema = z.object({
  method: z.enum(PAYMENT_METHODS),
  senderPhone: egyptianMobile,
  reference: z.string().trim().max(100).optional(),
  proofImageUrl: z.string().max(500).refine(isOwnImageUrl).optional(),
});

export type SubmitPaymentInput = z.output<typeof submitPaymentSchema>;

export const reviewPaymentSchema = z.object({
  note: z.string().trim().min(1).max(500).optional(),
});

export const paymentListQuerySchema = z.object({
  status: z.enum(PAYMENT_STATUSES).optional().catch(undefined),
});

export type PaymentListQuery = z.output<typeof paymentListQuerySchema>;

export type PaymentItem = {
  id: string;
  userId: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  reference?: string;
  senderPhone?: string;
  proofImageUrl?: string;
  status: PaymentStatus;
  reviewedAt?: string;
  note?: string;
  createdAt: string;
};

export type SubmitPaymentResult =
  | { ok: true; payment: PaymentItem }
  | { ok: false; code: "invalid_request" | "payment_pending" | "payments_unavailable" };

// "unchanged": the payment already has the requested status. "conflict": it was reviewed the other way.
export type ReviewPaymentResult = "ok" | "unchanged" | "conflict" | "not_found" | "invalid_request";
