import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { ActivityEventModel } from "../../src/features/activity/model";
import { getOverview } from "../../src/features/admin/service";
import type { UserDetail } from "../../src/features/admin/types";
import type { FeedbackPage } from "../../src/features/feedback/types";
import type { NotificationList } from "../../src/features/notifications/types";
import { connectToDatabase, disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { request, signUp } from "./client";

// Tests never send real email, and notify() dispatches in the background.
process.env.EMAIL_PROVIDER = "none";

const adminEmail = process.env.ADMIN_EMAIL ?? "";
const adminPassword = process.env.ADMIN_PASSWORD ?? "";
const missingId = "0123456789abcdef01234567";

type Customer = { cookie: string; id: string };

let adminCookie = "";
let customer: Customer;
let otherCustomer: Customer;

async function createCustomer(name: string): Promise<Customer> {
  const cookie = await signUp(name);
  const response = await request("/api/auth/get-session", { cookie });
  const { user } = (await response.json()) as { user: { id: string } };
  return { cookie, id: user.id };
}

function sendFeedback(body: unknown, cookie?: string): Promise<Response> {
  return request("/api/feedback", { method: "POST", cookie, body });
}

async function inbox(status?: string): Promise<FeedbackPage> {
  const query = status ? `?status=${status}` : "";
  const response = await request(`/api/admin/feedback${query}`, { cookie: adminCookie });
  assert.equal(response.status, 200, await response.clone().text());
  return (await response.json()) as FeedbackPage;
}

async function userDetail(userId: string): Promise<UserDetail> {
  const response = await request(`/api/admin/users/${userId}`, { cookie: adminCookie });
  assert.equal(response.status, 200, await response.clone().text());
  return (await response.json()) as UserDetail;
}

async function sendAndFindNew(cookie: string, message: string) {
  const sent = await sendFeedback({ message }, cookie);
  assert.equal(sent.status, 200);

  const item = (await inbox("new")).items.find((entry) => entry.message === message);
  assert.ok(item, "sent feedback is not in the admin inbox");
  return item;
}

before(async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");
  assert.ok(adminEmail && adminPassword, "admin test env is missing");

  const login = await request("/api/admin/session", {
    method: "POST",
    body: { email: adminEmail, password: adminPassword },
  });
  assert.equal(login.status, 200);
  adminCookie = login.headers.getSetCookie()[0].split(";")[0];

  customer = await createCustomer("Feedback Customer");
  otherCustomer = await createCustomer("Feedback Other");
  await connectToDatabase();
});

after(async () => {
  await disconnectFromDatabase();
});

test("a signed-in user's feedback appears in the admin inbox with a feedback_sent activity", async () => {
  const message = `Feedback ${randomUUID()}`;
  const newBefore = (await getOverview()).newFeedback;

  const sent = await sendFeedback({ message, rating: 4, page: "/en/dashboard" }, customer.cookie);
  assert.equal(sent.status, 200);

  assert.equal((await getOverview()).newFeedback - newBefore, 1);

  const item = (await inbox("new")).items.find((entry) => entry.message === message);
  assert.ok(item);
  assert.equal(item.userId, customer.id);
  assert.equal(item.userName, "Feedback Customer");
  assert.equal(item.rating, 4);
  assert.equal(item.status, "new");

  const detail = await userDetail(customer.id);
  assert.ok(detail.feedback.some((entry) => entry.message === message));

  const event = await ActivityEventModel.findOne({ userId: customer.id, type: "feedback_sent" });
  assert.equal(event?.actorId, customer.id);
});

test("signed-out feedback gets 401", async () => {
  assert.equal((await sendFeedback({ message: "Signed out" })).status, 401);
});

test("empty, whitespace-only, too long or out-of-range feedback gets 400", async () => {
  const invalid = [
    {},
    { message: "" },
    { message: "   " },
    { message: "x".repeat(2001) },
    { message: "Rating too high", rating: 6 },
    { message: "Rating zero", rating: 0 },
  ];

  for (const body of invalid) {
    const response = await sendFeedback(body, customer.cookie);
    assert.equal(response.status, 400, JSON.stringify(body).slice(0, 60));
  }

  assert.equal((await sendFeedback({ message: "y".repeat(2000) }, customer.cookie)).status, 200);
});

test("a non-admin cannot read the admin feedback API", async () => {
  assert.equal((await request("/api/admin/feedback")).status, 401);
  assert.equal((await request("/api/admin/feedback", { cookie: customer.cookie })).status, 401);
  assert.equal(
    (await request("/api/admin/feedback/" + missingId + "/reply", {
      method: "POST",
      cookie: customer.cookie,
      body: { reply: "Not an admin" },
    })).status,
    401,
  );
});

test("the inbox pages by 25 and filters by status", async () => {
  const page = await inbox("new");

  assert.equal(page.pageSize, 25);
  assert.ok(page.items.length <= 25);
  assert.ok(page.items.every((entry) => entry.status === "new"));
});

test("an admin reply resolves the feedback, notifies the user and is logged as the admin", async () => {
  const item = await sendAndFindNew(otherCustomer.cookie, `Reply ${randomUUID()}`);
  const reply = `Thanks, this is fixed ${randomUUID()}`;

  const response = await request(`/api/admin/feedback/${item.id}/reply`, {
    method: "POST",
    cookie: adminCookie,
    body: { reply },
  });
  assert.equal(response.status, 200);

  const resolved = (await userDetail(otherCustomer.id)).feedback.find((entry) => entry.id === item.id);
  assert.ok(resolved);
  assert.equal(resolved.status, "resolved");
  assert.equal(resolved.reply, reply);
  assert.ok(resolved.repliedAt);

  const notifications = (await (
    await request("/api/notifications", { cookie: otherCustomer.cookie })
  ).json()) as NotificationList;
  const replied = notifications.items.find((entry) => entry.type === "feedback_replied");
  assert.ok(replied);
  assert.deepEqual(replied.params, { reply });

  const event = await ActivityEventModel.findOne({ userId: otherCustomer.id, type: "feedback_replied" });
  assert.equal(event?.actorId, "admin");
});

test("an admin can mark feedback read, invalid status and unknown ids are refused", async () => {
  const item = await sendAndFindNew(customer.cookie, `Status ${randomUUID()}`);
  const path = `/api/admin/feedback/${item.id}/status`;

  assert.equal((await request(path, { method: "POST", cookie: adminCookie, body: { status: "read" } })).status, 200);

  const read = (await userDetail(customer.id)).feedback.find((entry) => entry.id === item.id);
  assert.equal(read?.status, "read");

  assert.equal(
    (await request(path, { method: "POST", cookie: adminCookie, body: { status: "deleted" } })).status,
    400,
  );
  assert.equal(
    (await request(`/api/admin/feedback/${missingId}/status`, {
      method: "POST",
      cookie: adminCookie,
      body: { status: "read" },
    })).status,
    404,
  );
  assert.equal(
    (await request(`/api/admin/feedback/${item.id}/reply`, {
      method: "POST",
      cookie: adminCookie,
      body: { reply: "   " },
    })).status,
    400,
  );
});
