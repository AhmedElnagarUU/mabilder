import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { budgetKeys, startKeys } from "../static-site-generator/blocks/contact-options";
import { inquiryKinds, inquiryStatuses, preferredTimes, spamReasons } from "./types";

const inquirySchema = new Schema(
  {
    siteId: { type: String, required: true },
    ownerId: { type: String, required: true },
    kind: { type: String, enum: inquiryKinds, required: true, default: "quote" },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    message: { type: String },
    service: { type: String },
    location: { type: String },
    area: { type: String },
    budget: { type: String, enum: budgetKeys },
    startWhen: { type: String, enum: startKeys },
    preferredDay: { type: String },
    preferredTime: { type: String, enum: preferredTimes },
    projectSlug: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    locale: { type: String, enum: ["en", "ar"], required: true },
    status: { type: String, enum: inquiryStatuses, required: true, default: "new" },
    spam: { type: Boolean, required: true, default: false },
    spamReason: { type: String, enum: spamReasons },
    notified: { type: Boolean, required: true, default: false },
    visitorHash: { type: String, required: true },
    // Valid requests live 12 months, spam 30 days; MongoDB deletes the document at this date.
    expiresAt: { type: Date, required: true },
  },
  { collection: "inquiries", timestamps: { createdAt: true, updatedAt: false } },
);

inquirySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
inquirySchema.index({ ownerId: 1, siteId: 1, createdAt: -1 });
inquirySchema.index({ siteId: 1, phone: 1, createdAt: -1 });
inquirySchema.index({ siteId: 1, visitorHash: 1, createdAt: -1 });

export type InquiryDocument = InferSchemaType<typeof inquirySchema>;

export const InquiryModel =
  (models.Inquiry as Model<InquiryDocument> | undefined) ??
  model<InquiryDocument>("Inquiry", inquirySchema);
