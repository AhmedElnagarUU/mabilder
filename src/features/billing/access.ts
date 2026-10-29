import { DAY_MS, TRIAL_DAYS } from "./plans";
import type { Access, SubscriptionRecord } from "./types";

type AccessSubscription = Pick<SubscriptionRecord, "status" | "currentPeriodEnd"> &
  Partial<Pick<SubscriptionRecord, "provider" | "trialEndsAt">>;

// Polar renews "active" subscriptions and tells us when they stop; a manual one just runs out.
function hasPaidAccess(subscription: AccessSubscription | null, now: Date): boolean {
  if (!subscription) {
    return false;
  }

  if (subscription.status === "active") {
    return subscription.provider !== "manual" || now < subscription.currentPeriodEnd;
  }

  return subscription.status === "canceled" && now < subscription.currentPeriodEnd;
}

function getTrialEndsAt(user: { createdAt: Date }, subscription: AccessSubscription | null): Date {
  const signUpTrialEnd = new Date(user.createdAt.getTime() + TRIAL_DAYS * DAY_MS);
  const extendedTrialEnd = subscription?.trialEndsAt;

  return extendedTrialEnd && extendedTrialEnd > signUpTrialEnd ? extendedTrialEnd : signUpTrialEnd;
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

  if (subscription?.status === "ended") {
    return { state: "expired" };
  }

  const trialEndsAt = getTrialEndsAt(user, subscription);

  if (now < trialEndsAt) {
    return { state: "trial", trialEndsAt };
  }

  return { state: "expired" };
}

export function trialDaysLeft(trialEndsAt: Date, now: Date = new Date()): number {
  return Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / DAY_MS));
}
