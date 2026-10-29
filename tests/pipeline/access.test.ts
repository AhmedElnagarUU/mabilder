import assert from "node:assert/strict";
import { test } from "node:test";
import { getAccess, trialDaysLeft } from "../../src/features/billing/access";
import { DAY_MS, TRIAL_DAYS } from "../../src/features/billing/plans";

const createdAt = new Date("2026-10-01T00:00:00Z");
const trialEndsAt = new Date(createdAt.getTime() + TRIAL_DAYS * DAY_MS);
const user = { createdAt };

test("the trial lasts 15 days from sign-up", () => {
  assert.equal(TRIAL_DAYS, 15);
  assert.equal(trialEndsAt.toISOString(), "2026-10-16T00:00:00.000Z");
});

test("a new user without a subscription is in trial until createdAt + 15 days", () => {
  const access = getAccess(user, null, new Date("2026-10-10T00:00:00Z"));

  assert.equal(access.state, "trial");
  assert.equal(access.trialEndsAt?.getTime(), trialEndsAt.getTime());
  assert.equal(access.renewsAt, undefined);
});

test("access is expired once the trial has ended and there is no subscription", () => {
  assert.equal(getAccess(user, null, trialEndsAt).state, "expired");
  assert.equal(getAccess(user, null, new Date("2026-12-01T00:00:00Z")).state, "expired");
});

test("an active subscription is active even after the trial and renews at the period end", () => {
  const currentPeriodEnd = new Date("2026-12-20T00:00:00Z");
  const access = getAccess(
    user,
    { status: "active", currentPeriodEnd },
    new Date("2026-11-20T00:00:00Z"),
  );

  assert.equal(access.state, "active");
  assert.equal(access.renewsAt?.getTime(), currentPeriodEnd.getTime());
  assert.equal(access.canceled, false);
});

test("a canceled subscription stays active until the period end, then expires", () => {
  const currentPeriodEnd = new Date("2026-12-20T00:00:00Z");
  const subscription = { status: "canceled", currentPeriodEnd };

  const before = getAccess(user, subscription, new Date("2026-12-19T23:59:59Z"));
  assert.equal(before.state, "active");
  assert.equal(before.canceled, true);

  assert.equal(getAccess(user, subscription, currentPeriodEnd).state, "expired");
  assert.equal(getAccess(user, subscription, new Date("2027-01-01T00:00:00Z")).state, "expired");
});

test("a canceled subscription during the trial falls back to the trial", () => {
  const subscription = { status: "canceled", currentPeriodEnd: new Date("2026-10-05T00:00:00Z") };

  assert.equal(getAccess(user, subscription, new Date("2026-10-08T00:00:00Z")).state, "trial");
});

test("revoked and unpaid subscriptions give no paid access", () => {
  const currentPeriodEnd = new Date("2027-01-01T00:00:00Z");
  const now = new Date("2026-11-20T00:00:00Z");

  for (const status of ["revoked", "past_due", "unpaid", "incomplete"]) {
    assert.equal(getAccess(user, { status, currentPeriodEnd }, now).state, "expired", status);
  }
});

test("trial days left rounds up and never goes below zero", () => {
  assert.equal(trialDaysLeft(trialEndsAt, new Date("2026-10-10T00:00:00Z")), 6);
  assert.equal(trialDaysLeft(trialEndsAt, new Date("2026-10-15T12:00:00Z")), 1);
  assert.equal(trialDaysLeft(trialEndsAt, new Date("2026-11-01T00:00:00Z")), 0);
});
