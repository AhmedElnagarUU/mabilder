import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ACTIVITY_TYPES } from "./types";

const EVENT_TTL_SECONDS = 365 * 24 * 60 * 60;

const activityEventSchema = new Schema(
  {
    userId: { type: String, required: true },
    actorId: { type: String, required: true },
    type: { type: String, enum: ACTIVITY_TYPES, required: true },
    siteId: { type: String },
    meta: { type: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { collection: "activity_events", versionKey: false },
);

activityEventSchema.index({ userId: 1, createdAt: -1 });
activityEventSchema.index({ createdAt: 1 }, { expireAfterSeconds: EVENT_TTL_SECONDS });

export type ActivityEventDocument = InferSchemaType<typeof activityEventSchema>;

export const ActivityEventModel =
  (models.ActivityEvent as Model<ActivityEventDocument> | undefined) ??
  model<ActivityEventDocument>("ActivityEvent", activityEventSchema);
