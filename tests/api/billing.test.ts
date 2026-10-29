import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { SubscriptionModel } from "../../src/features/billing/model";
import { DAY_MS, TRIAL_DAYS } from "../../src/features/billing/plans";
import { NotificationModel } from "../../src/features/notifications/model";
import { connectToDatabase, disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { request, signUp } from "./client";

// Tests never call Polar: webhooks are signed locally with the secret the test runner sets.
const webhookSecret = process.env.POLAR_WEBHOOK_SECRET ?? "";
const WEBHOOK_PATH = "/api/billing/webhook";
const MISSING_SITE_ID = "000000000000000000000000";

type TestUser = { id: string; cookie: string };

let active: TestUser;
let expired: TestUser;

async function createUser(name: string): Promise<TestUser> {
  const cookie = await signUp(name);
  const response = await request("/api/auth/get-session", { cookie });
  const body = (await response.json()) as { user: { id: string } };
  return { id: body.user.id, cookie };
}

function sign(id: string, timestamp: number, body: string, secret: string): string {
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const digest = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64");
  return `v1,${digest}`;
}

function subscriptionEvent(
  type: string,
  userId: string,
  subscriptionId: string,
  overrides: { status?: string; periodEnd?: Date } = {},
): string {
  const periodEnd = overrides.periodEnd ?? new Date(Date.now() + 30 * DAY_MS);

  return JSON.stringify({
    type,
    timestamp: new Date().toISOString(),
    data: {
      id: subscriptionId,
      status: overrides.status ?? "active",
      current_period_end: periodEnd.toISOString(),
      customer: { external_id: userId },
    },
  });
}

function postWebhook(
  body: string,
  options: { id?: string; secret?: string } = {},
): Promise<Response> {
  const id = options.id ?? `msg_${randomUUID()}`;
  const timestamp = Math.floor(Date.now() / 1000);

  return fetch(`${process.env.API_BASE_URL}${WEBHOOK_PATH}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "webhook-id": id,
      "webhook-timestamp": String(timestamp),
      "webhook-signature": sign(id, timestamp, body, options.secret ?? webhookSecret),
    },
    body,
  });
}

function put(path: string, user: TestUser, body: unknown): Promise<Response> {
  return request(path, { method: "PUT", cookie: user.cookie, body });
}

// Generate is called with fetch because the access check answers before any AI call.
function generate(user: TestUser): Promise<Response> {
  return fetch(`${process.env.API_BASE_URL}/api/sites/${MISSING_SITE_ID}/generate`, {
    method: "POST",
    headers: { cookie: user.cookie, origin: process.env.API_BASE_URL ?? "" },
  });
}

async function countPlanNotifications(userId: string): Promise<number> {
  return NotificationModel.countDocuments({ userId, type: "plan_changed" });
}

before(async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");
  assert.ok(webhookSecret, "POLAR_WEBHOOK_SECRET is set by the test runner");

  active = await createUser("B1 Active");
  expired = await createUser("B1 Expired");
  const mongo = await connectToDatabase();

  await mongo.connection.collection("user").updateOne(
    { _id: new mongo.Types.ObjectId(expired.id) },
    { $set: { createdAt: new Date(Date.now() - (TRIAL_DAYS + 1) * DAY_MS) } },
  );
});

after(async () => {
  await disconnectFromDatabase();
});

test("a signed subscription event upserts the subscription and notifies the plan change once", async () => {
  const body = subscriptionEvent("subscription.created", active.id, "sub_b1_active");

  assert.equal((await postWebhook(body)).status, 200);

  const record = await SubscriptionModel.findOne({ userId: active.id });
  assert.ok(record);
  assert.equal(record.provider, "polar");
  assert.equal(record.status, "active");
  assert.equal(record.externalId, "sub_b1_active");
  assert.equal(await countPlanNotifications(active.id), 1);
});

test("the same event twice leaves one record and no second notification", async () => {
  const body = subscriptionEvent("subscription.updated", active.id, "sub_b1_active");
  const id = `msg_${randomUUID()}`;

  assert.equal((await postWebhook(body, { id })).status, 200);
  assert.equal((await postWebhook(body, { id })).status, 200);

  assert.equal(await SubscriptionModel.countDocuments({ userId: active.id }), 1);
  assert.equal(await countPlanNotifications(active.id), 1);
});

test("a bad signature returns 403 and changes nothing", async () => {
  const body = subscriptionEvent("subscription.created", expired.id, "sub_b1_forged");
  const wrongSecret = `whsec_${Buffer.from("not-the-secret").toString("base64")}`;

  assert.equal((await postWebhook(body, { secret: wrongSecret })).status, 403);

  const unsigned = await fetch(`${process.env.API_BASE_URL}${WEBHOOK_PATH}`, {
    method: "POST",
    body,
  });
  assert.equal(unsigned.status, 403);
  assert.equal(await SubscriptionModel.countDocuments({ userId: expired.id }), 0);
});

test("an expired user gets 402 subscription_required on create, save and generate", async () => {
  const created = await request("/api/sites", {
    method: "POST",
    cookie: expired.cookie,
    body: { businessName: "Late Studio", industry: "Design", description: "A studio." },
  });
  assert.equal(created.status, 402);
  assert.equal(((await created.json()) as { code: string }).code, "subscription_required");

  const saved = await put(`/api/sites/${MISSING_SITE_ID}/content`, expired, {});
  assert.equal(saved.status, 402);
  assert.equal(((await saved.json()) as { code: string }).code, "subscription_required");

  const generated = await generate(expired);
  assert.equal(generated.status, 402);
  assert.equal(((await generated.json()) as { code: string }).code, "subscription_required");
});

test("a user in trial or with an active subscription is not blocked", async () => {
  const saved = await put(`/api/sites/${MISSING_SITE_ID}/content`, active, {});

  assert.notEqual(saved.status, 402);
});

test("a subscription event makes an expired user active and lets them save again", async () => {
  const body = subscriptionEvent("subscription.active", expired.id, "sub_b1_expired");

  assert.equal((await postWebhook(body)).status, 200);

  const saved = await put(`/api/sites/${MISSING_SITE_ID}/content`, expired, {});
  assert.notEqual(saved.status, 402);
  assert.equal(await countPlanNotifications(expired.id), 1);
});

test("a canceled subscription keeps access until the period end; a revoked one ends it now", async () => {
  const periodEnd = new Date(Date.now() + 10 * DAY_MS);

  const canceled = subscriptionEvent("subscription.canceled", expired.id, "sub_b1_expired", {
    status: "canceled",
    periodEnd,
  });
  assert.equal((await postWebhook(canceled)).status, 200);
  assert.notEqual((await put(`/api/sites/${MISSING_SITE_ID}/content`, expired, {})).status, 402);

  const revoked = subscriptionEvent("subscription.revoked", expired.id, "sub_b1_expired", {
    status: "canceled",
    periodEnd,
  });
  assert.equal((await postWebhook(revoked)).status, 200);
  assert.equal((await put(`/api/sites/${MISSING_SITE_ID}/content`, expired, {})).status, 402);
});

test("billing routes need a session, and the webhook ignores unknown customers", async () => {
  assert.equal((await request("/api/billing/checkout", { method: "POST", body: {} })).status, 401);
  assert.equal((await request("/api/billing/portal", { method: "POST", body: {} })).status, 401);

  const ghost = subscriptionEvent("subscription.created", "not-a-user", "sub_b1_ghost");
  assert.equal((await postWebhook(ghost)).status, 200);
  assert.equal(await SubscriptionModel.countDocuments({ externalId: "sub_b1_ghost" }), 0);
});
