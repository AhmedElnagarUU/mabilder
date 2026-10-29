import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { FEEDBACK_STATUSES } from "./types";

const feedbackSchema = new Schema(
  {
    userId: { type: String, required: true },
    message: { type: String, required: true, minlength: 1, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5 },
    page: { type: String, maxlength: 200 },
    status: { type: String, enum: FEEDBACK_STATUSES, default: "new", required: true },
    reply: { type: String, maxlength: 2000 },
    repliedAt: { type: Date },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { collection: "feedback", versionKey: false },
);

feedbackSchema.index({ status: 1, createdAt: -1 });
feedbackSchema.index({ userId: 1 });

export type FeedbackDocument = InferSchemaType<typeof feedbackSchema>;

export const FeedbackModel =
  (models.Feedback as Model<FeedbackDocument> | undefined) ??
  model<FeedbackDocument>("Feedback", feedbackSchema);
