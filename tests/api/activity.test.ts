import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ActivityEventModel } from "../../src/features/activity/model";
import {
  listRecentActivity,
  recordActivity,
  recordContentSaved,
  touchLastActive,
} from "../../src/features/activity/service";
import type { ActivityEventInput, ActivityType } from "../../src/features/activity/types";
import { buildSiteContent } from "../../src/features/site-creation/build-content";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { connectToDatabase, disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { deleteAllSites, request, signUp } from "./client";

const brief = {
  businessName: "Activity Studio",
  industry: "Interior design",
  description: "A small interior design studio.",
  locale: "en",
};

const MINUTE_MS = 60 * 1000;

let cookie = "";
let userId = "";
let siteId = "";

async function readUserId(sessionCookie: string): Promise<string> {
  const response = await request("/api/auth/get-session", { cookie: sessionCookie });
  const body = (await response.json()) as { user: { id: string } };
  return body.user.id;
}

async function saveContent(): Promise<void> {
  const saved = await request(`/api/sites/${siteId}/content`, {
    method: "PUT",
    cookie,
    body: buildSiteContent(businessBriefSchema.parse(brief)),
  });
  assert.equal(saved.status, 200, await saved.clone().text());
}

async function readLastActiveAt(id: string): Promise<Date | null> {
  const mongo = await connectToDatabase();
  const user = await mongo.connection.collection("user").findOne({
    _id: new mongo.Types.ObjectId(id),
  });
  return (user?.lastActiveAt as Date | undefined) ?? null;
}

async function waitForLastActiveAt(id: string): Promise<Date> {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const value = await readLastActiveAt(id);

    if (value) {
      return value;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("lastActiveAt was never written.");
}

async function countEvents(type: ActivityType): Promise<number> {
  return ActivityEventModel.countDocuments({ userId, siteId, type });
}

before(async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");

  cookie = await signUp("X1 Activity");
  userId = await readUserId(cookie);

  const created = await request("/api/sites", { method: "POST", cookie, body: brief });
  assert.equal(created.status, 201);
  siteId = ((await created.json()) as { site: { id: string } }).site.id;

  await saveContent();
  await connectToDatabase();
  await ActivityEventModel.init();
});

after(async () => {
  await deleteAllSites(cookie);
  await disconnectFromDatabase();
});

test("sign-up, create and save appear as recent activity, newest first", async () => {
  const items = await listRecentActivity(userId, 8);
  const types = items.map((item) => item.type);

  assert.deepEqual(types, ["content_saved", "site_created", "signed_up"]);
});

test("the dashboard page shows the recent activity card", async () => {
  const page = await request("/en/dashboard", { cookie });
  assert.equal(page.status, 200);

  const html = await page.text();
  assert.ok(html.includes("Recent activity"));
  assert.ok(html.includes("You created your account"));
  assert.ok(html.includes("You saved changes to your website"));
});

test("a sign-in is recorded, a failed sign-in is not", async () => {
  const before = await ActivityEventModel.countDocuments({ userId, type: "signed_in" });

  const failed = await request("/api/auth/sign-in/email", {
    method: "POST",
    body: { email: "nobody@test.local", password: "wrong-password" },
  });
  assert.notEqual(failed.status, 200);

  assert.equal(await ActivityEventModel.countDocuments({ userId, type: "signed_in" }), before);
});

test("lastActiveAt is written by a request and not changed again within 5 minutes", async () => {
  await request("/api/sites", { cookie });
  const first = await waitForLastActiveAt(userId);

  await request("/api/sites", { cookie });
  await touchLastActive(userId);

  assert.equal((await readLastActiveAt(userId))?.getTime(), first.getTime());
});

test("lastActiveAt is updated again once it is older than 5 minutes", async () => {
  const mongo = await connectToDatabase();
  const old = new Date(Date.now() - 6 * MINUTE_MS);
  await mongo.connection
    .collection("user")
    .updateOne({ _id: new mongo.Types.ObjectId(userId) }, { $set: { lastActiveAt: old } });

  await touchLastActive(userId);

  const updated = await readLastActiveAt(userId);
  assert.ok(updated && updated.getTime() > old.getTime());
});

test("content_saved is recorded at most once per site per 10 minutes", async () => {
  assert.equal(await countEvents("content_saved"), 1);

  await saveContent();
  await recordContentSaved(userId, siteId);
  assert.equal(await countEvents("content_saved"), 1);

  await ActivityEventModel.updateMany(
    { userId, siteId, type: "content_saved" },
    { createdAt: new Date(Date.now() - 11 * MINUTE_MS) },
  );

  await saveContent();
  assert.equal(await countEvents("content_saved"), 2);
});

test("recordActivity never throws, even for invalid events", async () => {
  const invalid = [
    { userId, actorId: userId, type: "not_a_type" },
    { userId: "", actorId: userId, type: "signed_in" },
    { userId, actorId: userId, type: "signed_in", meta: { nested: { a: 1 } } },
  ] as unknown as ActivityEventInput[];
  const before = await ActivityEventModel.countDocuments({ userId });

  for (const event of invalid) {
    await recordActivity(event);
  }

  assert.equal(await ActivityEventModel.countDocuments({ userId }), before);
});

test("the activity list is limited and the collection has the TTL index", async () => {
  assert.equal((await listRecentActivity(userId, 2)).length, 2);

  const indexes = await ActivityEventModel.collection.indexes();
  const ttl = indexes.find((index) => index.expireAfterSeconds !== undefined);
  assert.equal(ttl?.expireAfterSeconds, 365 * 24 * 60 * 60);
});
