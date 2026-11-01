import assert from "node:assert/strict";
import { randomInt } from "node:crypto";
import { after, before, test } from "node:test";
import { getOverview } from "../../src/features/admin/service";
import { InquiryModel } from "../../src/features/inquiries/model";
import type { InquiryItem } from "../../src/features/inquiries/types";
import { composeSite } from "../../src/features/site-creation/composition/compose";
import { buildFacts } from "../../src/features/site-creation/facts";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { connectToDatabase, disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { richProjects } from "../pipeline/samples";
import { deleteAllSites, request, signUp } from "./client";

const DAY_MS = 24 * 60 * 60 * 1000;
const brief = {
  businessName: "Inbox Studio",
  industry: "Interior design",
  description: "A small interior design studio.",
  locale: "en",
};

type Owner = { cookie: string; id: string; siteId: string };
type Inbox = { locked: boolean; newCount: number; items?: InquiryItem[] };

let ownerA: Owner;
let ownerB: Owner;
let lockedOwner: Owner;
let inactiveOwner: Owner;
let adminCookie = "";

function uniquePhone(): string {
  return `010${randomInt(10_000_000, 99_999_999)}`;
}

function quote(overrides: Record<string, unknown> = {}) {
  return { name: "Sara Ali", phone: uniquePhone(), message: "I need a villa designed.", elapsedMs: 6000, ...overrides };
}

function dayFromNow(days: number): string {
  return new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);
}

function visit(overrides: Record<string, unknown> = {}) {
  return {
    kind: "visit",
    name: "Omar Hassan",
    phone: uniquePhone(),
    service: "Interiors",
    location: "New Cairo",
    preferredDay: dayFromNow(7),
    preferredTime: "morning",
    message: "Please see the apartment before we decide.",
    elapsedMs: 6000,
    ...overrides,
  };
}

async function saveProjects(owner: Owner): Promise<void> {
  const content = composeSite({
    theme: "agenvo",
    locales: ["en"],
    defaultLocale: "en",
    facts: buildFacts(businessBriefSchema.parse(brief), richProjects),
    currentYear: 2026,
  });
  const saved = await request(`/api/sites/${owner.siteId}/content`, {
    method: "PUT",
    cookie: owner.cookie,
    body: content,
  });
  assert.equal(saved.status, 200, await saved.clone().text());
}

async function createOwner(name: string): Promise<Owner> {
  const cookie = await signUp(name);
  const session = await request("/api/auth/get-session", { cookie });
  const { user } = (await session.json()) as { user: { id: string } };

  const created = await request("/api/sites", { method: "POST", cookie, body: brief });
  assert.equal(created.status, 201, await created.clone().text());
  const { site } = (await created.json()) as { site: { id: string } };

  return { cookie, id: user.id, siteId: site.id };
}

function submit(siteId: string, body: unknown): Promise<Response> {
  return request(`/api/public/sites/${siteId}/inquiries`, { method: "POST", body });
}

async function readInbox(owner: Owner): Promise<Inbox> {
  const response = await request(`/api/sites/${owner.siteId}/inquiries`, { cookie: owner.cookie });
  assert.equal(response.status, 200, await response.clone().text());
  return (await response.json()) as Inbox;
}

type NotificationItem = { type: string; params: { kind?: string } };

async function inquiryNotificationItems(owner: Owner): Promise<NotificationItem[]> {
  const response = await request("/api/notifications", { cookie: owner.cookie });
  const { items } = (await response.json()) as { items: NotificationItem[] };
  return items.filter((item) => item.type === "inquiry_received");
}

async function inquiryNotifications(owner: Owner): Promise<number> {
  return (await inquiryNotificationItems(owner)).length;
}

async function reset(owner: Owner): Promise<void> {
  await InquiryModel.deleteMany({ siteId: owner.siteId });
}

function patch(owner: Owner, inquiryId: string, body: unknown, cookie = owner.cookie): Promise<Response> {
  return request(`/api/sites/${owner.siteId}/inquiries/${inquiryId}`, { method: "PATCH", cookie, body });
}

before(async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");
  await connectToDatabase();

  ownerA = await createOwner("Inbox Owner A");
  ownerB = await createOwner("Inbox Owner B");
  lockedOwner = await createOwner("Inbox Locked Owner");
  inactiveOwner = await createOwner("Inbox Inactive Owner");
  await saveProjects(ownerA);

  const mongo = await connectToDatabase();
  const users = mongo.connection.collection("user");
  await users.updateOne(
    { _id: new mongo.Types.ObjectId(lockedOwner.id) },
    { $set: { createdAt: new Date(Date.now() - 40 * DAY_MS) } },
  );
  await users.updateOne({ _id: new mongo.Types.ObjectId(inactiveOwner.id) }, { $set: { inactive: true } });

  const login = await request("/api/admin/session", {
    method: "POST",
    body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD },
  });
  assert.equal(login.status, 200);
  adminCookie = login.headers.getSetCookie()[0].split(";")[0];
});

after(async () => {
  for (const owner of [ownerA, ownerB, lockedOwner, inactiveOwner]) {
    await InquiryModel.deleteMany({ siteId: owner.siteId });
    await InquiryModel.deleteMany({ ownerId: owner.id });
  }

  await deleteAllSites(ownerA.cookie);
  await deleteAllSites(ownerB.cookie);
  await deleteAllSites(lockedOwner.cookie);
  await disconnectFromDatabase();
});

test("a valid quote is saved with a normalised phone and the owner is notified", async () => {
  await reset(ownerA);
  const before = await inquiryNotifications(ownerA);
  const body = quote({ phone: "0100 123 4567", service: "Interiors", budget: "medium", startWhen: "month", locale: "ar" });

  const response = await submit(ownerA.siteId, body);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");

  const inbox = await readInbox(ownerA);
  assert.equal(inbox.locked, false);
  assert.equal(inbox.items?.length, 1);
  assert.equal(inbox.items?.[0].phone, "+201001234567");
  assert.equal(inbox.items?.[0].spam, false);
  assert.equal(inbox.items?.[0].status, "new");
  assert.equal(inbox.items?.[0].budget, "medium");
  assert.equal(inbox.items?.[0].locale, "ar");
  assert.equal(inbox.newCount, 1);
  assert.equal(await inquiryNotifications(ownerA), before + 1);
});

test("a missing or bad phone gives 400 and nothing is stored", async () => {
  await reset(ownerA);

  const missing = await submit(ownerA.siteId, { ...quote(), phone: undefined });
  assert.equal(missing.status, 400);
  assert.equal(((await missing.json()) as { code: string }).code, "invalid_request");

  const bad = await submit(ownerA.siteId, quote({ phone: "12345" }));
  assert.equal(bad.status, 400);
  const errors = ((await bad.json()) as { errors: { path: string }[] }).errors;
  assert.ok(errors.some((error) => error.path === "phone"));

  const unknown = await submit(ownerA.siteId, quote({ isAdmin: true }));
  assert.equal(unknown.status, 400);

  assert.equal((await readInbox(ownerA)).items?.length, 0);
});

test("the honeypot and a too-fast form answer 200 but store nothing", async () => {
  await reset(ownerA);
  const before = await inquiryNotifications(ownerA);

  const honeypot = await submit(ownerA.siteId, quote({ website: "http://bot.example" }));
  const tooFast = await submit(ownerA.siteId, quote({ elapsedMs: 500 }));

  assert.equal(honeypot.status, 200);
  assert.equal(tooFast.status, 200);
  assert.equal((await readInbox(ownerA)).items?.length, 0);
  assert.equal(await inquiryNotifications(ownerA), before);
});

test("the 6th request from one visitor in an hour gets 429 and is not stored", async () => {
  await reset(ownerB);

  for (let count = 0; count < 5; count += 1) {
    assert.equal((await submit(ownerB.siteId, quote())).status, 200);
  }

  const sixth = await submit(ownerB.siteId, quote());

  assert.equal(sixth.status, 429);
  assert.equal(((await sixth.json()) as { code: string }).code, "rate_limited");
  assert.equal(await InquiryModel.countDocuments({ siteId: ownerB.siteId }), 5);
});

test("a message with a link is stored as spam: not new, no notification", async () => {
  await reset(ownerA);
  const before = await inquiryNotifications(ownerA);

  const response = await submit(ownerA.siteId, quote({ message: "Great offer at http://spam.example/now" }));
  const inbox = await readInbox(ownerA);

  assert.equal(response.status, 200);
  assert.equal(inbox.items?.length, 1);
  assert.equal(inbox.items?.[0].spam, true);
  assert.equal(inbox.items?.[0].spamReason, "links");
  assert.equal(inbox.newCount, 0);
  assert.equal(await inquiryNotifications(ownerA), before);
});

test("the same phone twice within 24 hours: the second is spam 'duplicate'", async () => {
  await reset(ownerA);
  const before = await inquiryNotifications(ownerA);
  const phone = uniquePhone();

  await submit(ownerA.siteId, quote({ phone }));
  await submit(ownerA.siteId, quote({ phone, name: "Sara again" }));
  const items = (await readInbox(ownerA)).items ?? [];

  assert.equal(items.length, 2);
  assert.equal(items.filter((item) => !item.spam).length, 1);
  assert.equal(items.find((item) => item.spam)?.spamReason, "duplicate");
  assert.equal(await inquiryNotifications(ownerA), before + 1);
});

test("an unknown site, a bad id and an inactive owner's site give 404 and store nothing", async () => {
  const unknown = await submit("64b0000000000000000000ff", quote());
  const bad = await submit("not-an-id", quote());
  const inactive = await submit(inactiveOwner.siteId, quote());

  assert.equal(unknown.status, 404);
  assert.equal(bad.status, 404);
  assert.equal(inactive.status, 404);
  assert.equal(((await inactive.json()) as { code: string }).code, "site_not_found");
  assert.equal(await InquiryModel.countDocuments({ siteId: inactiveOwner.siteId }), 0);
});

test("the CORS preflight is answered for any origin, POST only", async () => {
  const response = await request(`/api/public/sites/${ownerA.siteId}/inquiries`, { method: "OPTIONS" });

  assert.equal(response.status, 204);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.match(response.headers.get("access-control-allow-methods") ?? "", /POST/);
  assert.match(response.headers.get("access-control-allow-headers") ?? "", /Content-Type/i);
});

test("a form posted without JavaScript is saved and redirected back with ?sent=1", async () => {
  await reset(ownerA);
  const baseUrl = process.env.API_BASE_URL ?? "";
  const form = new URLSearchParams({ name: "Form Visitor", phone: uniquePhone(), email: "", message: "", website: "" });

  const response = await fetch(`${baseUrl}/api/public/sites/${ownerA.siteId}/inquiries`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", referer: `${baseUrl}/en/contact.html` },
    body: form,
    redirect: "manual",
  });

  assert.equal(response.status, 303);
  assert.ok(response.headers.get("location")?.includes("sent=1"));
  assert.equal((await readInbox(ownerA)).items?.length, 1);
});

test("the owner changes the status, marks spam and not spam; a rescued request notifies once", async () => {
  await reset(ownerA);
  await submit(ownerA.siteId, quote({ message: "Offer at http://spam.example" }));
  const before = await inquiryNotifications(ownerA);
  const [item] = (await readInbox(ownerA)).items ?? [];

  const contacted = await patch(ownerA, item.id, { status: "contacted" });
  assert.equal(contacted.status, 200);
  assert.equal(((await contacted.json()) as { inquiry: InquiryItem }).inquiry.status, "contacted");

  const rescued = await patch(ownerA, item.id, { spam: false });
  assert.equal(rescued.status, 200);
  assert.equal(((await rescued.json()) as { inquiry: InquiryItem }).inquiry.spam, false);
  assert.equal(await inquiryNotifications(ownerA), before + 1);

  await patch(ownerA, item.id, { spam: true });
  await patch(ownerA, item.id, { spam: false });
  assert.equal(await inquiryNotifications(ownerA), before + 1);

  assert.equal((await patch(ownerA, item.id, {})).status, 400);
  assert.equal((await patch(ownerA, item.id, { status: "sold" })).status, 400);
});

test("the owner deletes a request", async () => {
  await reset(ownerA);
  await submit(ownerA.siteId, quote());
  const [item] = (await readInbox(ownerA)).items ?? [];

  const removed = await request(`/api/sites/${ownerA.siteId}/inquiries/${item.id}`, {
    method: "DELETE",
    cookie: ownerA.cookie,
  });

  assert.equal(removed.status, 200);
  assert.equal((await readInbox(ownerA)).items?.length, 0);
});

test("user B gets 404 on user A's inquiries, and no session gets 401", async () => {
  await reset(ownerA);
  await submit(ownerA.siteId, quote());
  const [item] = (await readInbox(ownerA)).items ?? [];

  const list = await request(`/api/sites/${ownerA.siteId}/inquiries`, { cookie: ownerB.cookie });
  const update = await patch(ownerA, item.id, { status: "won" }, ownerB.cookie);
  const remove = await request(`/api/sites/${ownerA.siteId}/inquiries/${item.id}`, {
    method: "DELETE",
    cookie: ownerB.cookie,
  });
  const anonymous = await request(`/api/sites/${ownerA.siteId}/inquiries`);

  assert.equal(list.status, 404);
  assert.equal(update.status, 404);
  assert.equal(remove.status, 404);
  assert.equal(anonymous.status, 401);
  assert.equal((await readInbox(ownerA)).items?.length, 1);
});

test("after the trial the request is still saved, but the inbox shows only the count", async () => {
  await reset(lockedOwner);

  const response = await submit(lockedOwner.siteId, quote());
  const inbox = await readInbox(lockedOwner);

  assert.equal(response.status, 200);
  assert.equal(inbox.locked, true);
  assert.equal(inbox.newCount, 1);
  assert.equal(inbox.items, undefined);

  const [stored] = await InquiryModel.find({ siteId: lockedOwner.siteId }).lean();
  const update = await patch(lockedOwner, stored._id.toString(), { status: "won" });
  assert.equal(update.status, 402);
});

test("the admin sees counts only: numbers, no visitor name, phone or message", async () => {
  await reset(ownerA);
  const phone = uniquePhone();
  const name = "Visitor Hana Qadri Private";
  await submit(ownerA.siteId, quote({ phone, name, message: "A private message about my house." }));
  await submit(ownerA.siteId, quote({ message: "See http://spam.example" }));

  const detail = await request(`/api/admin/users/${ownerA.id}`, { cookie: adminCookie });
  const text = await detail.text();
  const { inquiries } = JSON.parse(text) as { inquiries: Record<string, unknown> };

  assert.equal(detail.status, 200);
  assert.deepEqual(inquiries, { total: 2, valid: 1, spam: 1, newCount: 1 });

  const overview = await getOverview();
  const overviewText = JSON.stringify(overview.inquiries);

  for (const key of ["total", "today", "last7Days", "last30Days", "valid", "spam"] as const) {
    assert.equal(typeof overview.inquiries[key], "number", key);
  }

  assert.ok(overview.inquiries.total >= 2);
  assert.ok(overview.inquiries.spamReasons.links && overview.inquiries.spamReasons.links >= 1);

  for (const secret of [name, phone, `+20${phone.slice(1)}`, "private message"]) {
    assert.ok(!text.includes(secret), `admin user detail leaks ${secret}`);
    assert.ok(!overviewText.includes(secret), `admin overview leaks ${secret}`);
  }
});

test("a valid site visit request is saved with its day and time, and the owner is told it is a visit", async () => {
  await reset(ownerA);
  const before = await inquiryNotifications(ownerA);

  const response = await submit(ownerA.siteId, visit({ locale: "ar" }));
  const [item] = (await readInbox(ownerA)).items ?? [];

  assert.equal(response.status, 200);
  assert.equal(item.kind, "visit");
  assert.equal(item.preferredDay, dayFromNow(7));
  assert.equal(item.preferredTime, "morning");
  assert.equal(item.service, "Interiors");
  assert.equal(item.spam, false);
  assert.equal(item.status, "new");
  assert.equal(await inquiryNotifications(ownerA), before + 1);
  assert.equal((await inquiryNotificationItems(ownerA)).filter((note) => note.params.kind === "visit").length >= 1, true);
});

test("a visit day that is in the past, over 12 months ahead, or not a date gives 400", async () => {
  await reset(ownerA);

  const past = await submit(ownerA.siteId, visit({ preferredDay: dayFromNow(-3) }));
  const far = await submit(ownerA.siteId, visit({ preferredDay: dayFromNow(400) }));
  const notADate = await submit(ownerA.siteId, visit({ preferredDay: "2026-02-31" }));
  const missing = await submit(ownerA.siteId, visit({ preferredDay: undefined }));

  for (const response of [past, far, notADate, missing]) {
    assert.equal(response.status, 400);
    assert.equal(((await response.json()) as { code: string }).code, "invalid_request");
  }

  assert.equal((await readInbox(ownerA)).items?.length, 0);
});

test("today and the day 12 months ahead are accepted", async () => {
  await reset(ownerA);

  const today = await submit(ownerA.siteId, visit({ preferredDay: dayFromNow(0) }));
  const latest = new Date();
  latest.setUTCMonth(latest.getUTCMonth() + 12);
  const edge = await submit(ownerA.siteId, visit({ preferredDay: latest.toISOString().slice(0, 10) }));

  assert.equal(today.status, 200);
  assert.equal(edge.status, 200);
  assert.equal((await readInbox(ownerA)).items?.length, 2);
});

test("a bad preferred time, an unknown field or a bad phone on a visit gives 400", async () => {
  await reset(ownerA);

  const time = await submit(ownerA.siteId, visit({ preferredTime: "midnight" }));
  const unknown = await submit(ownerA.siteId, visit({ budget: "large" }));
  const phone = await submit(ownerA.siteId, visit({ phone: "12345" }));

  assert.equal(time.status, 400);
  assert.equal(unknown.status, 400);
  assert.equal(phone.status, 400);
  assert.equal((await readInbox(ownerA)).items?.length, 0);
});

test("a visit keeps the same spam checks: honeypot stores nothing, a link is spam without a notification", async () => {
  await reset(ownerA);
  const before = await inquiryNotifications(ownerA);

  const honeypot = await submit(ownerA.siteId, visit({ website: "http://bot.example" }));
  const link = await submit(ownerA.siteId, visit({ message: "Visit http://spam.example now" }));
  const items = (await readInbox(ownerA)).items ?? [];

  assert.equal(honeypot.status, 200);
  assert.equal(link.status, 200);
  assert.equal(items.length, 1);
  assert.equal(items[0].spam, true);
  assert.equal(items[0].spamReason, "links");
  assert.equal(await inquiryNotifications(ownerA), before);
});

test("a project slug of this site is kept with its title; an unknown one is dropped but the request is saved", async () => {
  await reset(ownerA);

  const known = await submit(ownerA.siteId, quote({ projectSlug: "corporate-tower" }));
  const knownVisit = await submit(ownerA.siteId, visit({ projectSlug: "corporate-tower" }));
  const unknown = await submit(ownerA.siteId, quote({ projectSlug: "not-a-project-of-this-site" }));
  const items = (await readInbox(ownerA)).items ?? [];

  assert.equal(known.status, 200);
  assert.equal(knownVisit.status, 200);
  assert.equal(unknown.status, 200);
  assert.equal(items.length, 3);
  assert.equal(items.filter((item) => item.projectSlug === "corporate-tower").length, 2);
  assert.ok(items.filter((item) => item.projectSlug).every((item) => item.projectTitle === "Corporate Tower"));
  assert.ok(items.filter((item) => item.projectSlug).every((item) => item.projectHref?.includes("/projects/corporate-tower.html")));
  assert.equal(items.filter((item) => item.projectSlug === undefined).length, 1);
  assert.equal(await InquiryModel.countDocuments({ siteId: ownerA.siteId, projectSlug: "not-a-project-of-this-site" }), 0);
});

test("a project slug of another site is dropped on a site without projects", async () => {
  await reset(ownerB);

  const response = await submit(ownerB.siteId, quote({ projectSlug: "corporate-tower" }));
  const [item] = (await readInbox(ownerB)).items ?? [];

  assert.equal(response.status, 200);
  assert.equal(item.projectSlug, undefined);
});

test("the inbox can be filtered by kind, and user B still gets 404", async () => {
  await reset(ownerA);
  await submit(ownerA.siteId, quote());
  await submit(ownerA.siteId, visit());

  const visits = await request(`/api/sites/${ownerA.siteId}/inquiries?kind=visit`, { cookie: ownerA.cookie });
  const quotes = await request(`/api/sites/${ownerA.siteId}/inquiries?kind=quote`, { cookie: ownerA.cookie });
  const all = await request(`/api/sites/${ownerA.siteId}/inquiries?kind=nonsense`, { cookie: ownerA.cookie });
  const other = await request(`/api/sites/${ownerA.siteId}/inquiries?kind=visit`, { cookie: ownerB.cookie });

  const visitItems = ((await visits.json()) as Inbox).items ?? [];
  const quoteItems = ((await quotes.json()) as Inbox).items ?? [];

  assert.equal(visitItems.length, 1);
  assert.equal(visitItems[0].kind, "visit");
  assert.equal(quoteItems.length, 1);
  assert.equal(quoteItems[0].kind, "quote");
  assert.equal((((await all.json()) as Inbox).items ?? []).length, 2);
  assert.equal(other.status, 404);
});
