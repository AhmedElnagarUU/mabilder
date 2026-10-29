import { getAccess } from "./access";
import { findAllSubscriptions, findAllUserCreatedAt } from "./repository";
import type { AccessState } from "./types";

export type PlanCounts = Record<AccessState, number>;

export async function countPlans(now: Date = new Date()): Promise<PlanCounts> {
  const [createdAtByUser, subscriptions] = await Promise.all([
    findAllUserCreatedAt(),
    findAllSubscriptions(),
  ]);
  const counts: PlanCounts = { trial: 0, active: 0, expired: 0 };

  for (const [userId, createdAt] of createdAtByUser) {
    counts[getAccess({ createdAt }, subscriptions.get(userId) ?? null, now).state] += 1;
  }

  return counts;
}
