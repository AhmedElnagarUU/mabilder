import mongoose from "mongoose";
import { connectToDatabase } from "../../shared/db/mongoose";
import { ActivityEventModel } from "./model";
import type { ActivityEvent, ActivityItem, ActivityType } from "./types";

type LeanEvent = {
  _id: { toString(): string };
  type: ActivityType;
  createdAt: Date;
};

export async function insertActivity(event: ActivityEvent): Promise<void> {
  await connectToDatabase();
  await ActivityEventModel.create(event);
}

export async function hasActivitySince(
  userId: string,
  siteId: string,
  type: ActivityType,
  since: Date,
): Promise<boolean> {
  await connectToDatabase();

  const found = await ActivityEventModel.exists({
    userId,
    siteId,
    type,
    createdAt: { $gte: since },
  });

  return found !== null;
}

export async function findRecentActivity(
  userId: string,
  limit: number,
): Promise<ActivityItem[]> {
  await connectToDatabase();

  const events = (await ActivityEventModel.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()) as unknown as LeanEvent[];

  return events.map((event) => ({
    id: event._id.toString(),
    type: event.type,
    createdAt: event.createdAt.toISOString(),
  }));
}

// The `user` collection belongs to better-auth, so it is updated without a mongoose model.
export async function setLastActiveIfStale(
  userId: string,
  now: Date,
  staleBefore: Date,
): Promise<void> {
  if (!mongoose.isValidObjectId(userId)) {
    return;
  }

  const mongo = await connectToDatabase();

  await mongo.connection.collection("user").updateOne(
    {
      _id: new mongoose.Types.ObjectId(userId),
      $or: [{ lastActiveAt: { $exists: false } }, { lastActiveAt: { $lt: staleBefore } }],
    },
    { $set: { lastActiveAt: now } },
  );
}
