import { getAccess } from "./access";
import { findSubscription, findUserCreatedAt } from "./repository";
import type { Access } from "./types";

// An unknown user gets no access.
export async function getUserAccess(userId: string, now: Date = new Date()): Promise<Access> {
  const [createdAt, subscription] = await Promise.all([
    findUserCreatedAt(userId),
    findSubscription(userId),
  ]);

  if (!createdAt) {
    return { state: "expired" };
  }

  return getAccess({ createdAt }, subscription, now);
}
