import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { SUBSCRIPTION_PROVIDERS } from "./types";

const subscriptionSchema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    provider: { type: String, enum: SUBSCRIPTION_PROVIDERS, required: true },
    status: { type: String, required: true },
    currentPeriodEnd: { type: Date, required: true },
    externalId: { type: String },
    trialEndsAt: { type: Date },
    updatedAt: { type: Date, default: Date.now, required: true },
  },
  { collection: "subscriptions", versionKey: false },
);

subscriptionSchema.index({ externalId: 1 });

export type SubscriptionDocument = InferSchemaType<typeof subscriptionSchema>;

export const SubscriptionModel =
  (models.Subscription as Model<SubscriptionDocument> | undefined) ??
  model<SubscriptionDocument>("Subscription", subscriptionSchema);
