import mongoose from "mongoose";
import { connectToDatabase } from "../../../shared/db/mongoose";
import { PaymentModel } from "./model";
import type {
  PaymentItem,
  PaymentListQuery,
  PaymentMethod,
  PaymentStatus,
  SubmitPaymentInput,
} from "./types";

type LeanPayment = {
  _id: { toString(): string };
  userId: string;
  method: PaymentMethod;
  amount: number;
  currency: string;
  reference?: string;
  senderPhone?: string;
  proofImageUrl?: string;
  status: PaymentStatus;
  reviewedAt?: Date;
  note?: string;
  createdAt: Date;
};

const HISTORY_LIMIT = 100;

function toItem(doc: LeanPayment): PaymentItem {
  return {
    id: doc._id.toString(),
    userId: doc.userId,
    method: doc.method,
    amount: doc.amount,
    currency: doc.currency,
    reference: doc.reference,
    senderPhone: doc.senderPhone,
    proofImageUrl: doc.proofImageUrl,
    status: doc.status,
    reviewedAt: doc.reviewedAt?.toISOString(),
    note: doc.note,
    createdAt: doc.createdAt.toISOString(),
  };
}

export function isDuplicateKey(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

export async function hasPendingPayment(userId: string): Promise<boolean> {
  await connectToDatabase();
  return (await PaymentModel.exists({ userId, status: "pending" })) !== null;
}

export async function insertPayment(
  userId: string,
  input: SubmitPaymentInput,
  amount: number,
  currency: string,
): Promise<PaymentItem> {
  await connectToDatabase();
  const created = await PaymentModel.create({ userId, ...input, amount, currency, status: "pending" });

  return toItem(created.toObject() as unknown as LeanPayment);
}

export async function findPaymentsForUser(userId: string): Promise<PaymentItem[]> {
  await connectToDatabase();

  const payments = (await PaymentModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(HISTORY_LIMIT)
    .lean()) as unknown as LeanPayment[];

  return payments.map(toItem);
}

// Pending payments come first (oldest first, so the queue is worked in order), then the history.
export async function findPayments(query: PaymentListQuery): Promise<PaymentItem[]> {
  await connectToDatabase();

  if (query.status) {
    const sort = query.status === "pending" ? 1 : -1;
    const filtered = (await PaymentModel.find({ status: query.status })
      .sort({ createdAt: sort })
      .limit(HISTORY_LIMIT)
      .lean()) as unknown as LeanPayment[];

    return filtered.map(toItem);
  }

  const [pending, reviewed] = (await Promise.all([
    PaymentModel.find({ status: "pending" }).sort({ createdAt: 1 }).lean(),
    PaymentModel.find({ status: { $ne: "pending" } })
      .sort({ createdAt: -1 })
      .limit(HISTORY_LIMIT)
      .lean(),
  ])) as unknown as [LeanPayment[], LeanPayment[]];

  return [...pending, ...reviewed].map(toItem);
}

export async function countPendingPayments(): Promise<number> {
  await connectToDatabase();
  return PaymentModel.countDocuments({ status: "pending" });
}

export async function findPaymentById(paymentId: string): Promise<PaymentItem | null> {
  if (!mongoose.isValidObjectId(paymentId)) {
    return null;
  }

  await connectToDatabase();
  const payment = (await PaymentModel.findById(paymentId).lean()) as LeanPayment | null;

  return payment ? toItem(payment) : null;
}

// Only a pending payment can be claimed, so two reviews of the same payment never both win.
export async function claimPendingPayment(
  paymentId: string,
  review: { status: "approved" | "rejected"; reviewedBy: string; reviewedAt: Date; note?: string },
): Promise<PaymentItem | null> {
  if (!mongoose.isValidObjectId(paymentId)) {
    return null;
  }

  await connectToDatabase();

  const claimed = (await PaymentModel.findOneAndUpdate(
    { _id: paymentId, status: "pending" },
    { $set: review },
    { new: true },
  ).lean()) as LeanPayment | null;

  return claimed ? toItem(claimed) : null;
}
