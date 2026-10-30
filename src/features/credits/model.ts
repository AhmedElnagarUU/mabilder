import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const creditUseSchema = new Schema(
  {
    ownerId: { type: String, required: true },
    cost: { type: Number, required: true, min: 1 },
    reason: { type: String, required: true },
    siteId: { type: String },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { collection: "credit_uses", versionKey: false },
);

creditUseSchema.index({ ownerId: 1, createdAt: -1 });

export type CreditUseDocument = InferSchemaType<typeof creditUseSchema>;

export const CreditUseModel =
  (models.CreditUse as Model<CreditUseDocument> | undefined) ??
  model<CreditUseDocument>("CreditUse", creditUseSchema);
