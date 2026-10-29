import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { EMAIL_STATUSES, NOTIFICATION_LOCALES, NOTIFICATION_TYPES } from "./types";

const notificationSchema = new Schema(
  {
    userId: { type: String, required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    params: { type: Schema.Types.Mixed, default: {} },
    readAt: { type: Date },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { collection: "notifications", versionKey: false },
);

notificationSchema.index({ userId: 1, createdAt: -1 });

const emailOutboxSchema = new Schema(
  {
    notificationId: { type: String },
    to: { type: String, required: true },
    locale: { type: String, enum: NOTIFICATION_LOCALES, required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    params: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, enum: EMAIL_STATUSES, default: "queued", required: true },
    attempts: { type: Number, default: 0, required: true },
    lastError: { type: String },
    nextAttemptAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, required: true },
  },
  { collection: "email_outbox", versionKey: false },
);

emailOutboxSchema.index({ status: 1, nextAttemptAt: 1 });

export type NotificationDocument = InferSchemaType<typeof notificationSchema>;
export type EmailOutboxDocument = InferSchemaType<typeof emailOutboxSchema>;

export const NotificationModel =
  (models.Notification as Model<NotificationDocument> | undefined) ??
  model<NotificationDocument>("Notification", notificationSchema);

export const EmailOutboxModel =
  (models.EmailOutbox as Model<EmailOutboxDocument> | undefined) ??
  model<EmailOutboxDocument>("EmailOutbox", emailOutboxSchema);
