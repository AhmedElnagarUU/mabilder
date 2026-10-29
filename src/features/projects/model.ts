import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { MAX_PROJECT_PHOTOS } from "./types";

const localizedTextSchema = new Schema(
  { en: { type: String }, ar: { type: String } },
  { _id: false },
);

const photoSchema = new Schema(
  { url: { type: String, required: true }, alt: { type: String } },
  { _id: false },
);

const projectSchema = new Schema(
  {
    ownerId: { type: String, required: true, index: true },
    siteId: { type: String, required: true, index: true },
    title: { type: localizedTextSchema, required: true },
    category: { type: localizedTextSchema },
    location: { type: localizedTextSchema },
    year: { type: String },
    description: { type: localizedTextSchema },
    photos: {
      type: [photoSchema],
      default: [],
      validate: (photos: unknown[]) => photos.length <= MAX_PROJECT_PHOTOS,
    },
    showOnHome: { type: Boolean, required: true, default: true },
    order: { type: Number, required: true },
  },
  { collection: "projects", timestamps: true },
);

export type ProjectDocument = InferSchemaType<typeof projectSchema>;

export const ProjectModel =
  (models.Project as Model<ProjectDocument> | undefined) ??
  model<ProjectDocument>("Project", projectSchema);
