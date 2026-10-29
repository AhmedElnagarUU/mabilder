import mongoose from "mongoose";
import { connectToDatabase } from "../../shared/db/mongoose";
import { EmailOutboxModel, NotificationModel } from "./model";
import {
  toNotificationLocale,
  type NotificationItem,
  type NotificationRecipient,
  type NotificationType,
  type QueuedEmail,
} from "./types";

type LeanNotification = {
  _id: { toString(): string };
  type: NotificationType;
  params: Record<string, string | number>;
  readAt?: Date | null;
  createdAt: Date;
};

type LeanOutbox = {
  _id: { toString(): string };
  to: string;
  locale: string;
  type: NotificationType;
  params: unknown;
  attempts: number;
};

type UserContact = {
  _id: { toString(): string };
  email?: string;
  locale?: string;
};

function toRecipient(user: UserContact): NotificationRecipient | null {
  if (!user.email) {
    return null;
  }

  return {
    userId: user._id.toString(),
    email: user.email,
    locale: toNotificationLocale(user.locale),
  };
}

function toObjectIds(ids: string[]): mongoose.Types.ObjectId[] {
  return ids
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));
}

function toQueuedEmail(item: LeanOutbox): QueuedEmail {
  return {
    id: item._id.toString(),
    to: item.to,
    locale: toNotificationLocale(item.locale),
    type: item.type,
    params: item.params,
    attempts: item.attempts,
  };
}

// The `user` collection belongs to better-auth, so it is read without a mongoose model.
export async function findRecipient(userId: string): Promise<NotificationRecipient | null> {
  if (!mongoose.isValidObjectId(userId)) {
    return null;
  }

  const mongo = await connectToDatabase();
  const user = (await mongo.connection
    .collection("user")
    .findOne({ _id: new mongoose.Types.ObjectId(userId) })) as UserContact | null;

  return user ? toRecipient(user) : null;
}

export async function findAdminRecipients(): Promise<NotificationRecipient[]> {
  const mongo = await connectToDatabase();
  const admins = (await mongo.connection
    .collection("user")
    .find({ role: "admin" })
    .toArray()) as unknown as UserContact[];

  return admins.flatMap((admin) => toRecipient(admin) ?? []);
}

export async function insertNotificationWithEmail(
  recipient: NotificationRecipient,
  type: NotificationType,
  params: object,
  now: Date,
): Promise<void> {
  await connectToDatabase();

  const notification = await NotificationModel.create({
    userId: recipient.userId,
    type,
    params,
    createdAt: now,
  });

  await EmailOutboxModel.create({
    notificationId: notification._id.toString(),
    to: recipient.email,
    locale: recipient.locale,
    type,
    params,
    nextAttemptAt: now,
    createdAt: now,
  });
}

export async function findNotifications(
  userId: string,
  limit: number,
): Promise<NotificationItem[]> {
  await connectToDatabase();

  const notifications = (await NotificationModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()) as unknown as LeanNotification[];

  return notifications.map((notification) => ({
    id: notification._id.toString(),
    type: notification.type,
    params: notification.params,
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
  }));
}

export async function countUnread(userId: string): Promise<number> {
  await connectToDatabase();
  return NotificationModel.countDocuments({ userId, readAt: { $exists: false } });
}

// Only the owner's unread items match, so ids of other users' items are ignored.
export async function markRead(
  userId: string,
  ids: string[] | undefined,
  now: Date,
): Promise<void> {
  await connectToDatabase();

  const filter: Record<string, unknown> = { userId, readAt: { $exists: false } };

  if (ids) {
    filter._id = { $in: toObjectIds(ids) };
  }

  await NotificationModel.updateMany(filter, { readAt: now });
}

// The claim moves nextAttemptAt forward, so a second run cannot pick the same item.
export async function claimQueuedEmail(
  now: Date,
  claimedUntil: Date,
): Promise<QueuedEmail | null> {
  await connectToDatabase();

  const item = (await EmailOutboxModel.findOneAndUpdate(
    { status: "queued", nextAttemptAt: { $lte: now } },
    { nextAttemptAt: claimedUntil },
    { sort: { nextAttemptAt: 1 }, returnDocument: "before" },
  ).lean()) as unknown as LeanOutbox | null;

  return item ? toQueuedEmail(item) : null;
}

export async function markEmailSent(id: string): Promise<void> {
  await EmailOutboxModel.updateOne({ _id: id }, { status: "sent" });
}

export async function markEmailRetry(
  id: string,
  attempts: number,
  nextAttemptAt: Date,
  lastError: string,
): Promise<void> {
  await EmailOutboxModel.updateOne({ _id: id }, { attempts, nextAttemptAt, lastError });
}

export async function markEmailFailed(
  id: string,
  attempts: number,
  lastError: string,
): Promise<void> {
  await EmailOutboxModel.updateOne({ _id: id }, { status: "failed", attempts, lastError });
}
