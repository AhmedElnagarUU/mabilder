import { recordActivity } from "../../activity/service";
import { notify, notifyAdmins } from "../../notifications/service";
import { addPaidMonth } from "../manual-plan";
import { getProPriceEgp } from "../settings/service";
import {
  claimPendingPayment,
  countPendingPayments,
  findPaymentById,
  findPayments,
  findPaymentsForUser,
  hasPendingPayment,
  insertPayment,
  isDuplicateKey,
} from "./repository";
import {
  PAYMENT_CURRENCY,
  paymentListQuerySchema,
  reviewPaymentSchema,
  submitPaymentSchema,
  type PaymentItem,
  type PaymentStatus,
  type ReviewPaymentResult,
  type SubmitPaymentInput,
  type SubmitPaymentResult,
} from "./types";

async function insertIfNoneIsPending(
  userId: string,
  input: SubmitPaymentInput,
  priceEgp: number,
): Promise<PaymentItem | null> {
  if (await hasPendingPayment(userId)) {
    return null;
  }

  try {
    return await insertPayment(userId, input, priceEgp, PAYMENT_CURRENCY);
  } catch (error) {
    if (isDuplicateKey(error)) {
      return null;
    }

    throw error;
  }
}

export async function submitPayment(
  user: { id: string; name: string },
  input: unknown,
): Promise<SubmitPaymentResult> {
  const priceEgp = getProPriceEgp();

  if (priceEgp === null) {
    return { ok: false, code: "payments_unavailable" };
  }

  const parsed = submitPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, code: "invalid_request" };
  }

  const payment = await insertIfNoneIsPending(user.id, parsed.data, priceEgp);

  if (!payment) {
    return { ok: false, code: "payment_pending" };
  }

  await recordActivity({
    userId: user.id,
    actorId: user.id,
    type: "payment_submitted",
    meta: { method: payment.method },
  });
  await notifyAdmins("payment_received", {
    userName: user.name || "A customer",
    amount: payment.amount,
    currency: payment.currency,
  });

  return { ok: true, payment };
}

export async function listOwnPayments(userId: string): Promise<PaymentItem[]> {
  return findPaymentsForUser(userId);
}

export async function listPayments(queryInput: unknown): Promise<PaymentItem[]> {
  return findPayments(paymentListQuerySchema.parse(queryInput ?? {}));
}

export async function getPendingPaymentCount(): Promise<number> {
  return countPendingPayments();
}

async function resultOfMissedClaim(
  paymentId: string,
  wanted: PaymentStatus,
): Promise<ReviewPaymentResult> {
  const existing = await findPaymentById(paymentId);

  if (!existing) {
    return "not_found";
  }

  return existing.status === wanted ? "unchanged" : "conflict";
}

function formatPaidUntil(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function approvePayment(
  paymentId: string,
  reviewerId: string,
  input: unknown,
): Promise<ReviewPaymentResult> {
  const review = reviewPaymentSchema.safeParse(input ?? {});

  if (!review.success) {
    return "invalid_request";
  }

  const now = new Date();
  const payment = await claimPendingPayment(paymentId, {
    status: "approved",
    reviewedBy: reviewerId,
    reviewedAt: now,
    note: review.data.note,
  });

  if (!payment) {
    return resultOfMissedClaim(paymentId, "approved");
  }

  const paidUntil = await addPaidMonth(payment.userId, now);

  await recordActivity({
    userId: payment.userId,
    actorId: reviewerId,
    type: "payment_approved",
    meta: { paymentId: payment.id },
  });

  if (paidUntil) {
    await notify(payment.userId, "payment_approved", { paidUntil: formatPaidUntil(paidUntil) });
  }

  return "ok";
}

export async function rejectPayment(
  paymentId: string,
  reviewerId: string,
  input: unknown,
): Promise<ReviewPaymentResult> {
  const review = reviewPaymentSchema.safeParse(input ?? {});

  if (!review.success) {
    return "invalid_request";
  }

  const payment = await claimPendingPayment(paymentId, {
    status: "rejected",
    reviewedBy: reviewerId,
    reviewedAt: new Date(),
    note: review.data.note,
  });

  if (!payment) {
    return resultOfMissedClaim(paymentId, "rejected");
  }

  await recordActivity({
    userId: payment.userId,
    actorId: reviewerId,
    type: "payment_rejected",
    meta: { paymentId: payment.id },
  });
  await notify(payment.userId, "payment_rejected", { note: review.data.note });

  return "ok";
}
