import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const siteSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    brief: { type: Schema.Types.Mixed, required: true },
    content: { type: Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ["draft", "generating", "ready", "error"],
      default: "draft",
      required: true,
    },
    error: { type: String, default: null },
  },
  { timestamps: true },
);

export type SiteDocument = InferSchemaType<typeof siteSchema>;

export const SiteModel =
  (models.Site as Model<SiteDocument> | undefined) ??
  model<SiteDocument>("Site", siteSchema);
