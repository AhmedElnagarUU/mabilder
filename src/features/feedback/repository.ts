import mongoose from "mongoose";
import { connectToDatabase } from "../../shared/db/mongoose";
import { FeedbackModel } from "./model";
import type { FeedbackRow, FeedbackStatus, SendFeedbackInput } from "./types";

type LeanFeedback = {
  _id: { toString(): string };
  userId: string;
  message: string;
  rating?: number | null;
  page?: string | null;
  status: FeedbackStatus;
  reply?: string | null;
  repliedAt?: Date | null;
  createdAt: Date;
};

export type FeedbackFilter = {
  status?: FeedbackStatus;
  userId?: string;
};

export type FeedbackContact = {
  name: string;
  email: string;
};

type UserContact = {
  _id: { toString(): string };
  name?: string;
  email?: string;
};

function toRow(item: LeanFeedback): FeedbackRow {
  return {
    id: item._id.toString(),
    userId: item.userId,
    message: item.message,
    rating: item.rating ?? null,
    page: item.page ?? null,
    status: item.status,
    reply: item.reply ?? null,
    repliedAt: item.repliedAt ? item.repliedAt.toISOString() : null,
    createdAt: item.createdAt.toISOString(),
  };
}

export async function insertFeedback(input: SendFeedbackInput, userId: string, now: Date): Promise<void> {
  await connectToDatabase();

  await FeedbackModel.create({ ...input, userId, createdAt: now });
}

export async function findFeedbackPage(
  filter: FeedbackFilter,
  skip: number,
  limit: number,
): Promise<FeedbackRow[]> {
  await connectToDatabase();

  const items = (await FeedbackModel.find(filter)
    .sort({ createdAt: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .lean()) as unknown as LeanFeedback[];

  return items.map(toRow);
}

export async function countFeedback(filter: FeedbackFilter): Promise<number> {
  await connectToDatabase();
  return FeedbackModel.countDocuments(filter);
}

export async function findFeedbackById(id: string): Promise<FeedbackRow | null> {
  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  await connectToDatabase();

  const item = (await FeedbackModel.findById(id).lean()) as unknown as LeanFeedback | null;
  return item ? toRow(item) : null;
}

export async function updateFeedbackStatus(id: string, status: FeedbackStatus): Promise<void> {
  await connectToDatabase();
  await FeedbackModel.updateOne({ _id: id }, { status });
}

// Replying always resolves the item, so the inbox shows it as done.
export async function saveFeedbackReply(id: string, reply: string, now: Date): Promise<void> {
  await connectToDatabase();
  await FeedbackModel.updateOne({ _id: id }, { reply, repliedAt: now, status: "resolved" });
}

// The `user` collection belongs to better-auth, so it is read without a mongoose model.
export async function findContacts(userIds: string[]): Promise<Map<string, FeedbackContact>> {
  const ids = userIds
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  if (ids.length === 0) {
    return new Map();
  }

  const mongo = await connectToDatabase();
  const users = (await mongo.connection
    .collection("user")
    .find({ _id: { $in: ids } }, { projection: { name: 1, email: 1 } })
    .toArray()) as unknown as UserContact[];

  return new Map(
    users.map((user) => [user._id.toString(), { name: user.name ?? "", email: user.email ?? "" }]),
  );
}
