import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { PAYMENT_METHODS, PAYMENT_STATUSES } from "./types";

const paymentSchema = new Schema(
  {
    userId: { type: String, required: true },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    reference: { type: String, required: true },
    senderPhone: { type: String },
    status: { type: String, enum: PAYMENT_STATUSES, required: true, default: "pending" },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    note: { type: String },
    createdAt: { type: Date, required: true, default: Date.now },
  },
  { collection: "payments", versionKey: false },
);

paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ userId: 1, createdAt: -1 });
// Backs the "one pending payment per user" rule even when two submits race.
paymentSchema.index(
  { userId: 1 },
  { unique: true, partialFilterExpression: { status: "pending" } },
);

export type PaymentDocument = InferSchemaType<typeof paymentSchema>;

export const PaymentModel =
  (models.Payment as Model<PaymentDocument> | undefined) ??
  model<PaymentDocument>("Payment", paymentSchema);
