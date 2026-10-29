import { DAY_MS, TRIAL_DAYS } from "./plans";
import type { Access, SubscriptionRecord } from "./types";

type AccessSubscription = Pick<SubscriptionRecord, "status" | "currentPeriodEnd">;

// Same rule for every provider: active while "active", or "canceled" until the period ends.
function hasPaidAccess(subscription: AccessSubscription | null, now: Date): boolean {
  if (!subscription) {
    return false;
  }

  if (subscription.status === "active") {
    return true;
  }

  return subscription.status === "canceled" && now < subscription.currentPeriodEnd;
}

export function getAccess(
  user: { createdAt: Date },
  subscription: AccessSubscription | null,
  now: Date = new Date(),
): Access {
  if (subscription && hasPaidAccess(subscription, now)) {
    return {
      state: "active",
      renewsAt: subscription.currentPeriodEnd,
      canceled: subscription.status === "canceled",
    };
  }

  const trialEndsAt = new Date(user.createdAt.getTime() + TRIAL_DAYS * DAY_MS);

  if (now < trialEndsAt) {
    return { state: "trial", trialEndsAt };
  }

  return { state: "expired" };
}

export function trialDaysLeft(trialEndsAt: Date, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / DAY_MS));
}
