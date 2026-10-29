import mongoose from "mongoose";
import { connectToDatabase } from "../../shared/db/mongoose";
import { SiteModel } from "../site-creation/model";
import type { SiteStatus } from "../site-creation/types";
import type { UserListQuery, UserProfile } from "./types";

type LeanUser = {
  _id: { toString(): string };
  name?: string;
  email?: string;
  inactive?: boolean;
  locale?: string;
  lastActiveAt?: Date;
  createdAt?: Date;
};

type Filter = Record<string, unknown>;

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

function toObjectId(userId: string): mongoose.Types.ObjectId | null {
  return OBJECT_ID_PATTERN.test(userId) ? new mongoose.Types.ObjectId(userId) : null;
}

function toProfile(user: LeanUser): UserProfile {
  return {
    id: user._id.toString(),
    name: user.name ?? "",
    email: user.email ?? "",
    inactive: user.inactive === true,
    locale: user.locale ?? null,
    lastActiveAt: user.lastActiveAt?.toISOString() ?? null,
    createdAt: user.createdAt?.toISOString() ?? null,
  };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildUserFilter(query: UserListQuery): Filter {
  const filter: Filter = {};

  if (query.search) {
    const pattern = { $regex: escapeRegExp(query.search), $options: "i" };
    filter.$or = [{ name: pattern }, { email: pattern }];
  }

  if (query.status === "active") {
    filter.inactive = { $ne: true };
  }

  if (query.status === "inactive") {
    filter.inactive = true;
  }

  return filter;
}

// The `user` and `session` collections belong to better-auth, so they are used without mongoose models.
async function userCollection() {
  const mongo = await connectToDatabase();
  return mongo.connection.collection("user");
}

export async function countUsers(filter: Filter): Promise<number> {
  return (await userCollection()).countDocuments(filter);
}

export async function countSitesWithStatus(status: SiteStatus): Promise<number> {
  await connectToDatabase();
  return SiteModel.countDocuments({ status });
}

export async function findUsers(
  query: UserListQuery,
  skip: number,
  limit: number,
): Promise<UserProfile[]> {
  const sortField = query.sort === "joined" ? "createdAt" : "lastActiveAt";
  const users = (await (await userCollection())
    .find(buildUserFilter(query))
    .sort({ [sortField]: -1, _id: -1 })
    .skip(skip)
    .limit(limit)
    .toArray()) as unknown as LeanUser[];

  return users.map(toProfile);
}

export async function countMatchingUsers(query: UserListQuery): Promise<number> {
  return countUsers(buildUserFilter(query));
}

export async function findUser(userId: string): Promise<UserProfile | null> {
  const id = toObjectId(userId);

  if (!id) {
    return null;
  }

  const user = (await (await userCollection()).findOne({ _id: id })) as LeanUser | null;
  return user ? toProfile(user) : null;
}

export async function findSiteStatuses(
  userIds: string[],
): Promise<Map<string, SiteStatus>> {
  await connectToDatabase();

  const sites = await SiteModel.find({ ownerId: { $in: userIds } }, { ownerId: 1, status: 1 }).lean();

  return new Map(sites.map((site) => [site.ownerId, site.status]));
}

// Returns true only when the flag actually changed, so repeating an action records nothing twice.
export async function setInactiveFlag(
  userId: string,
  inactive: boolean,
): Promise<boolean> {
  const id = toObjectId(userId);

  if (!id) {
    return false;
  }

  const result = await (await userCollection()).updateOne(
    { _id: id, inactive: inactive ? { $ne: true } : true },
    { $set: { inactive } },
  );

  return result.modifiedCount > 0;
}

export async function deleteUserSessions(userId: string): Promise<void> {
  const id = toObjectId(userId);

  if (!id) {
    return;
  }

  const mongo = await connectToDatabase();

  await mongo.connection
    .collection("session")
    .deleteMany({ userId: { $in: [userId, id] } });
}
