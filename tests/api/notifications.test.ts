import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { checkCronSecret } from "../../src/features/notifications/cron-secret";
import { dispatchQueuedEmails } from "../../src/features/notifications/dispatch";
import { consoleEmailProvider } from "../../src/features/notifications/email/console";
import type {
  EmailMessage,
  EmailProvider,
} from "../../src/features/notifications/email/provider";
import { EmailOutboxModel, NotificationModel } from "../../src/features/notifications/model";
import { notify } from "../../src/features/notifications/service";
import type {
  NotificationItem,
  NotificationList,
} from "../../src/features/notifications/types";
import { connectToDatabase, disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { request, signUp } from "./client";

// Tests never send real email, and notify() dispatches in the background.
process.env.EMAIL_PROVIDER = "none";

const MINUTE_MS = 60 * 1000;
const BACKOFF_MINUTES = [1, 5, 15, 60];
const cronSecret = process.env.CRON_SECRET ?? "";

// Far-future time so server runs that use the real clock never touch these outbox items.
const FAR_FUTURE = new Date("2100-01-01T00:00:00Z");
const DISPATCH_ALL = 1000;

type TestUser = { cookie: string; id: string; email: string };

let userA: TestUser;
let userB: TestUser;

async function createUser(name: string): Promise<TestUser> {
  const cookie = await signUp(name);
  const response = await request("/api/auth/get-session", { cookie });
  const body = (await response.json()) as { user: { id: string; email: string } };
  return { cookie, id: body.user.id, email: body.user.email };
}

async function readNotifications(user: TestUser): Promise<NotificationList> {
  const response = await request("/api/notifications", { cookie: user.cookie });
  assert.equal(response.status, 200);
  return (await response.json()) as NotificationList;
}

function markRead(user: TestUser, body?: unknown): Promise<Response> {
  return request("/api/notifications/read", { method: "POST", cookie: user.cookie, body });
}

function createSpyProvider(): { provider: EmailProvider; calls: EmailMessage[] } {
  const calls: EmailMessage[] = [];

  return {
    calls,
    provider: {
      async send(message) {
        calls.push(message);
      },
    },
  };
}

function queueEmail(to: string, businessName = "Spy Studio") {
  return EmailOutboxModel.create({
    notificationId: `test-${to}`,
    to,
    locale: "en",
    type: "site_ready",
    params: { businessName },
    nextAttemptAt: FAR_FUTURE,
  });
}

function uniqueAddress(): string {
  return `${crypto.randomUUID()}@outbox.test`;
}

before(async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");

  userA = await createUser("X2 Alice");
  userB = await createUser("X2 Bob");
  await connectToDatabase();
});

after(async () => {
  await disconnectFromDatabase();
});

test("notify stores an in-app notification and queues one email for the user", async () => {
  await notify(userA.id, "site_ready", { businessName: "Alice Studio" });

  const notification = await NotificationModel.findOne({ userId: userA.id, type: "site_ready" });
  assert.ok(notification);
  assert.equal(notification.readAt, undefined);

  const outbox = await EmailOutboxModel.find({ notificationId: notification._id.toString() });
  assert.equal(outbox.length, 1);
  assert.equal(outbox[0].to, userA.email);
  assert.equal(outbox[0].locale, "en");
  assert.equal(outbox[0].type, "site_ready");
});

test("notify never throws, even for an unknown user or invalid params", async () => {
  const errors = console.error;
  console.error = () => {};

  try {
    await notify("not-a-user", "welcome", { name: "Nobody" });
    await notify(userA.id, "welcome", { name: "" });
  } finally {
    console.error = errors;
  }

  assert.equal(await NotificationModel.countDocuments({ userId: userA.id, type: "welcome" }), 1);
});

test("dispatch sends a queued email once through the provider and escapes the html", async () => {
  const to = uniqueAddress();
  await queueEmail(to, "<b>Spy</b> & Co");
  const { provider, calls } = createSpyProvider();

  await dispatchQueuedEmails(DISPATCH_ALL, provider, FAR_FUTURE);
  await dispatchQueuedEmails(DISPATCH_ALL, provider, FAR_FUTURE);

  const sent = calls.filter((call) => call.to === to);
  assert.equal(sent.length, 1);
  assert.ok(sent[0].subject.length > 0);
  assert.ok(sent[0].text.includes("<b>Spy</b> & Co"));
  assert.ok(sent[0].html.includes("&lt;b&gt;Spy&lt;/b&gt; &amp; Co"));
  assert.ok(!sent[0].html.includes("<b>Spy"));
  assert.equal((await EmailOutboxModel.findOne({ to }))?.status, "sent");
});

test("the console provider logs to, subject and text but not the html", async () => {
  const logged: string[] = [];
  const log = console.log;
  console.log = (...args: unknown[]) => logged.push(args.join(" "));

  try {
    await consoleEmailProvider.send({
      to: "who@console.test",
      subject: "Hello subject",
      text: "Plain body",
      html: "<p>HTML-ONLY-MARKER</p>",
    });
  } finally {
    console.log = log;
  }

  const output = logged.join("\n");
  assert.ok(output.includes("who@console.test"));
  assert.ok(output.includes("Hello subject"));
  assert.ok(output.includes("Plain body"));
  assert.ok(!output.includes("HTML-ONLY-MARKER"));
});

test("a failing provider is retried with backoff and the email ends as failed after 5 attempts", async () => {
  const to = uniqueAddress();
  await queueEmail(to);
  let sends = 0;
  const failing: EmailProvider = {
    async send(message) {
      if (message.to === to) {
        sends += 1;
      }

      throw new Error("x".repeat(500));
    },
  };

  let now = FAR_FUTURE;

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    await dispatchQueuedEmails(DISPATCH_ALL, failing, now);

    const item = await EmailOutboxModel.findOne({ to });
    assert.ok(item);
    assert.equal(item.attempts, attempt);
    assert.equal(sends, attempt);
    assert.equal(item.lastError?.length, 200);

    if (attempt < 5) {
      assert.equal(item.status, "queued");
      assert.equal(
        item.nextAttemptAt.getTime() - now.getTime(),
        BACKOFF_MINUTES[attempt - 1] * MINUTE_MS,
      );
      now = item.nextAttemptAt;
    } else {
      assert.equal(item.status, "failed");
    }
  }

  await dispatchQueuedEmails(DISPATCH_ALL, failing, new Date(now.getTime() + 24 * 60 * MINUTE_MS));
  assert.equal(sends, 5);
});

test("an email is not sent before its next attempt time", async () => {
  const to = uniqueAddress();
  await queueEmail(to);
  const { provider, calls } = createSpyProvider();

  await dispatchQueuedEmails(DISPATCH_ALL, provider, new Date(FAR_FUTURE.getTime() - MINUTE_MS));

  assert.equal(calls.filter((call) => call.to === to).length, 0);
  await EmailOutboxModel.deleteOne({ to });
});

test("two concurrent dispatch runs never send the same item twice", async () => {
  const addresses = Array.from({ length: 8 }, uniqueAddress);
  await Promise.all(addresses.map((to) => queueEmail(to)));
  const { provider, calls } = createSpyProvider();

  await Promise.all([
    dispatchQueuedEmails(DISPATCH_ALL, provider, FAR_FUTURE),
    dispatchQueuedEmails(DISPATCH_ALL, provider, FAR_FUTURE),
  ]);

  for (const to of addresses) {
    assert.equal(calls.filter((call) => call.to === to).length, 1, to);
  }
});

test("GET /api/notifications returns only the signed-in user's items", async () => {
  const listA = await readNotifications(userA);
  const listB = await readNotifications(userB);
  const idsA = new Set(listA.items.map((item: NotificationItem) => item.id));

  assert.ok(listA.items.some((item) => item.type === "site_ready"));
  assert.ok(listB.items.every((item) => !idsA.has(item.id)));
  assert.ok(listB.items.every((item) => item.type === "welcome"));
  assert.ok(listA.unreadCount >= 2);
  assert.equal(listB.unreadCount, 1);
});

test("signing up creates a welcome notification with the user's name", async () => {
  const welcome = (await readNotifications(userB)).items.find((item) => item.type === "welcome");

  assert.ok(welcome);
  assert.deepEqual(welcome.params, { name: "X2 Bob" });
  assert.equal(welcome.readAt, null);
});

test("signed-out requests get 401", async () => {
  assert.equal((await request("/api/notifications")).status, 401);
  assert.equal((await request("/api/notifications/read", { method: "POST", body: {} })).status, 401);
});

test("a user cannot mark another user's notifications as read", async () => {
  const before = await readNotifications(userA);
  const ids = before.items.map((item) => item.id);

  const attempt = await markRead(userB, { ids });
  assert.equal(attempt.status, 200);

  const after = await readNotifications(userA);
  assert.equal(after.unreadCount, before.unreadCount);
  assert.ok(after.items.every((item) => item.readAt === null));
});

test("mark read works for given ids and for all", async () => {
  const before = await readNotifications(userA);
  const [first] = before.items;

  assert.equal((await markRead(userA, { ids: [first.id] })).status, 200);
  const afterOne = await readNotifications(userA);
  assert.equal(afterOne.unreadCount, before.unreadCount - 1);
  assert.ok(afterOne.items.find((item) => item.id === first.id)?.readAt);

  assert.equal((await markRead(userA)).status, 200);
  assert.equal((await readNotifications(userA)).unreadCount, 0);

  assert.equal((await markRead(userA, { ids: "nope" })).status, 400);
});

test("the dispatch route rejects a missing or wrong secret and accepts the right one", async () => {
  assert.ok(cronSecret, "CRON_SECRET is set by the test runner");

  const path = "/api/internal/notifications/dispatch";
  const send = (secret?: string) =>
    fetch(`${process.env.API_BASE_URL}${path}`, {
      method: "POST",
      headers: secret === undefined ? {} : { "x-cron-secret": secret },
    });

  assert.equal((await send()).status, 401);
  assert.equal((await send("wrong-secret")).status, 401);

  const ok = await send(cronSecret);
  assert.equal(ok.status, 200);
  assert.equal(typeof ((await ok.json()) as { processed: number }).processed, "number");
});

test("the cron secret check reports a missing server secret", () => {
  const saved = process.env.CRON_SECRET;
  delete process.env.CRON_SECRET;

  try {
    assert.equal(checkCronSecret("anything"), "unconfigured");
  } finally {
    process.env.CRON_SECRET = saved;
  }

  assert.equal(checkCronSecret(saved ?? null), "ok");
});
