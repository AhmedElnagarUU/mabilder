import mongoose from "mongoose";
import { connectToDatabase } from "../../shared/db/mongoose";
import { SubscriptionModel } from "./model";
import type { SubscriptionRecord } from "./types";

type LeanSubscription = {
  userId: string;
  provider: SubscriptionRecord["provider"];
  status: string;
  currentPeriodEnd: Date;
  externalId?: string;
};

function toRecord(doc: LeanSubscription | null): SubscriptionRecord | null {
  if (!doc) {
    return null;
  }

  return {
    userId: doc.userId,
    provider: doc.provider,
    status: doc.status,
    currentPeriodEnd: doc.currentPeriodEnd,
    externalId: doc.externalId,
  };
}

function isDuplicateKey(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { code?: number }).code === 11000;
}

export async function findSubscription(userId: string): Promise<SubscriptionRecord | null> {
  await connectToDatabase();

  return toRecord((await SubscriptionModel.findOne({ userId }).lean()) as LeanSubscription | null);
}

// The `user` collection belongs to better-auth, so it is read without a mongoose model.
export async function findUserCreatedAt(userId: string): Promise<Date | null> {
  if (!mongoose.isValidObjectId(userId)) {
    return null;
  }

  const mongo = await connectToDatabase();
  const user = await mongo.connection
    .collection("user")
    .findOne({ _id: new mongoose.Types.ObjectId(userId) }, { projection: { createdAt: 1 } });

  return user?.createdAt instanceof Date ? user.createdAt : null;
}

async function upsertOnce(record: SubscriptionRecord): Promise<SubscriptionRecord | null> {
  const previous = (await SubscriptionModel.findOneAndUpdate(
    { userId: record.userId },
    { $set: { ...record, updatedAt: new Date() } },
    { upsert: true, new: false, runValidators: true },
  ).lean()) as LeanSubscription | null;

  return toRecord(previous);
}

// Returns the record that existed before. Polar sends several events at once for a new
// subscription, so a lost upsert race on the unique userId is retried once.
export async function upsertSubscription(
  record: SubscriptionRecord,
): Promise<SubscriptionRecord | null> {
  await connectToDatabase();

  try {
    return await upsertOnce(record);
  } catch (error) {
    if (!isDuplicateKey(error)) {
      throw error;
    }

    return upsertOnce(record);
  }
}
