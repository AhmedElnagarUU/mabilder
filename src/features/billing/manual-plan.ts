import { z } from "zod";
import { recordActivity } from "../activity/service";
import { notify } from "../notifications/service";
import { getAccess } from "./access";
import { addOneMonth } from "./plans";
import { findSubscription, findUserCreatedAt, upsertSubscription } from "./repository";
import type { SubscriptionRecord } from "./types";

export const planChangeSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("extend_trial"), until: z.coerce.date() }),
  z.object({ action: z.literal("grant_pro"), until: z.coerce.date() }),
  z.object({ action: z.literal("end_plan") }),
]);

export type PlanChangeResult = "ok" | "not_found" | "invalid_request" | "plan_active";

const PLAN_BY_ACTION = { extend_trial: "trial", grant_pro: "pro", end_plan: "expired" } as const;

// An approved payment adds one month after whatever paid time the user still has left.
export async function addPaidMonth(userId: string, now: Date): Promise<Date | null> {
  const [createdAt, subscription] = await Promise.all([
    findUserCreatedAt(userId),
    findSubscription(userId),
  ]);

  if (!createdAt) {
    return null;
  }

  const access = getAccess({ createdAt }, subscription, now);
  const base = access.state === "active" && access.renewsAt ? access.renewsAt : now;
  const paidUntil = addOneMonth(base);

  await upsertSubscription({
    userId,
    provider: "manual",
    status: "active",
    currentPeriodEnd: paidUntil,
  });

  return paidUntil;
}

function buildRecord(
  userId: string,
  change: z.output<typeof planChangeSchema>,
  now: Date,
): SubscriptionRecord {
  switch (change.action) {
    case "extend_trial":
      return {
        userId,
        provider: "manual",
        status: "trial",
        currentPeriodEnd: change.until,
        trialEndsAt: change.until,
      };
    case "grant_pro":
      return { userId, provider: "manual", status: "active", currentPeriodEnd: change.until };
    case "end_plan":
      return { userId, provider: "manual", status: "ended", currentPeriodEnd: now };
  }
}

export async function changeUserPlan(
  userId: string,
  actorId: string,
  input: unknown,
  now: Date = new Date(),
): Promise<PlanChangeResult> {
  const parsed = planChangeSchema.safeParse(input);

  if (!parsed.success || ("until" in parsed.data && parsed.data.until <= now)) {
    return "invalid_request";
  }

  const change = parsed.data;
  const [createdAt, subscription] = await Promise.all([
    findUserCreatedAt(userId),
    findSubscription(userId),
  ]);

  if (!createdAt) {
    return "not_found";
  }

  if (change.action === "extend_trial" && getAccess({ createdAt }, subscription, now).state === "active") {
    return "plan_active";
  }

  await upsertSubscription(buildRecord(userId, change, now));

  const plan = PLAN_BY_ACTION[change.action];
  const meta: Record<string, string> = { plan };

  if ("until" in change) {
    meta.until = change.until.toISOString();
  }

  await recordActivity({ userId, actorId, type: "plan_changed", meta });
  await notify(userId, "plan_changed", { plan });

  return "ok";
}
