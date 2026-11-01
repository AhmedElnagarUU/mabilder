import assert from "node:assert/strict";
import { randomInt } from "node:crypto";
import { after, before, test } from "node:test";
import { InquiryModel } from "../../src/features/inquiries/model";
import type { InquiryItem } from "../../src/features/inquiries/types";
import { composeSite } from "../../src/features/site-creation/composition/compose";
import { buildFacts } from "../../src/features/site-creation/facts";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { connectToDatabase, disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { richProjects } from "../pipeline/samples";
import { deleteAllSites, request, signUp } from "./client";

const brief = {
  businessName: "Review Studio",
  industry: "Interior design",
  description: "A small interior design studio.",
  locale: "en",
};

type Owner = { cookie: string; id: string; siteId: string };
type Inbox = { locked: boolean; newCount: number; items?: InquiryItem[] };

let ownerA: Owner;
let ownerB: Owner;

function uniqueComment(): string {
  return `Reliable and tidy crew from start to finish, job ${randomInt(100_000, 999_999)}`;
}

function review(overrides: Record<string, unknown> = {}) {
  return { kind: "review", name: "Mona Samir", rating: 5, comment: uniqueComment(), elapsedMs: 6000, ...overrides };
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

async function saveSiteContent(owner: Owner): Promise<void> {
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

function submit(siteId: string, body: unknown): Promise<Response> {
  return request(`/api/public/sites/${siteId}/inquiries`, { method: "POST", body });
}

async function readReviews(owner: Owner, kind = "review"): Promise<InquiryItem[]> {
  const response = await request(`/api/sites/${owner.siteId}/inquiries?kind=${kind}`, { cookie: owner.cookie });
  assert.equal(response.status, 200, await response.clone().text());
  return ((await response.json()) as Inbox).items ?? [];
}

async function homeHtml(owner: Owner): Promise<string> {
  const preview = await request(`/preview/${owner.siteId}/index.html`, { cookie: owner.cookie });
  assert.equal(preview.status, 200);
  return preview.text();
}

function patch(owner: Owner, id: string, body: unknown, cookie = owner.cookie): Promise<Response> {
  return request(`/api/sites/${owner.siteId}/inquiries/${id}`, { method: "PATCH", cookie, body });
}

async function reviewNotifications(owner: Owner): Promise<number> {
  const response = await request("/api/notifications", { cookie: owner.cookie });
  const { items } = (await response.json()) as { items: { type: string; params: { kind?: string } }[] };
  return items.filter((item) => item.type === "inquiry_received" && item.params.kind === "review").length;
}

async function reset(owner: Owner): Promise<void> {
  await InquiryModel.deleteMany({ siteId: owner.siteId });
}

before(async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");
  await connectToDatabase();

  ownerA = await createOwner("Review Owner A");
  ownerB = await createOwner("Review Owner B");
  await saveSiteContent(ownerA);
});

after(async () => {
  for (const owner of [ownerA, ownerB]) {
    await InquiryModel.deleteMany({ siteId: owner.siteId });
  }

  await deleteAllSites(ownerA.cookie);
  await deleteAllSites(ownerB.cookie);
  await disconnectFromDatabase();
});

test("a valid review is saved as pending and the owner is notified", async () => {
  await reset(ownerA);
  const before = await reviewNotifications(ownerA);
  const body = review({ locale: "ar", projectSlug: "corporate-tower" });

  const response = await submit(ownerA.siteId, body);
  const [item] = await readReviews(ownerA);

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.equal(item.kind, "review");
  assert.equal(item.reviewStatus, "pending");
  assert.equal(item.rating, 5);
  assert.equal(item.message, body.comment);
  assert.equal(item.phone, "");
  assert.equal(item.spam, false);
  assert.equal(item.projectSlug, "corporate-tower");
  assert.equal(item.locale, "ar");
  assert.equal(await reviewNotifications(ownerA), before + 1);
});

test("a rating of 0, 6, 2.5 or text, a comment over 600 characters or a phone gives 400 and stores nothing", async () => {
  await reset(ownerA);

  for (const overrides of [
    { rating: 0 },
    { rating: 6 },
    { rating: 2.5 },
    { rating: "abc" },
    { rating: undefined },
    { comment: "x".repeat(601) },
    { comment: undefined },
    { name: undefined },
    { phone: "01001234567" },
  ]) {
    const response = await submit(ownerA.siteId, review(overrides));

    assert.equal(response.status, 400, JSON.stringify(overrides));
    assert.equal(((await response.json()) as { code: string }).code, "invalid_request");
  }

  assert.equal(await InquiryModel.countDocuments({ siteId: ownerA.siteId }), 0);
});

test("a rating sent as the text of a radio button is accepted", async () => {
  await reset(ownerA);

  assert.equal((await submit(ownerA.siteId, review({ rating: "4" }))).status, 200);
  assert.equal((await readReviews(ownerA))[0].rating, 4);
});

test("a second review from the same visitor on the same day is rejected and not stored", async () => {
  await reset(ownerA);

  const first = await submit(ownerA.siteId, review());
  const second = await submit(ownerA.siteId, review());

  assert.equal(first.status, 200);
  assert.equal(second.status, 429);
  assert.equal(((await second.json()) as { code: string }).code, "rate_limited");
  assert.equal(await InquiryModel.countDocuments({ siteId: ownerA.siteId }), 1);
});

test("the honeypot and a too-fast form store nothing; a link in the comment is spam without a notification", async () => {
  await reset(ownerA);
  const before = await reviewNotifications(ownerA);

  const honeypot = await submit(ownerA.siteId, review({ website: "http://bot.example" }));
  const tooFast = await submit(ownerA.siteId, review({ elapsedMs: 500 }));
  const link = await submit(ownerA.siteId, review({ comment: "Best prices at http://spam.example/now" }));
  const items = await readReviews(ownerA);

  assert.equal(honeypot.status, 200);
  assert.equal(tooFast.status, 200);
  assert.equal(link.status, 200);
  assert.equal(items.length, 1);
  assert.equal(items[0].spam, true);
  assert.equal(items[0].spamReason, "links");
  assert.equal(await reviewNotifications(ownerA), before);
});

test("approve puts the review on the site, hide takes it off after the site is rendered again", async () => {
  await reset(ownerA);
  const body = review({ name: "Hala Fathy", rating: 4 });
  await submit(ownerA.siteId, body);
  const [item] = await readReviews(ownerA);

  assert.ok(!(await homeHtml(ownerA)).includes(body.comment), "a pending review is shown");

  const approved = await patch(ownerA, item.id, { reviewStatus: "approved" });
  assert.equal(approved.status, 200);
  assert.equal(((await approved.json()) as { inquiry: InquiryItem }).inquiry.reviewStatus, "approved");

  const shown = await homeHtml(ownerA);
  assert.ok(shown.includes(body.comment));
  assert.ok(shown.includes("Hala Fathy"));
  assert.ok(!shown.includes(" / 5 ("), "the average needs 3 reviews");

  const hidden = await patch(ownerA, item.id, { reviewStatus: "hidden" });
  assert.equal(hidden.status, 200);
  assert.ok(!(await homeHtml(ownerA)).includes(body.comment), "a hidden review is still shown");
});

test("a comment with HTML is shown as text on the site", async () => {
  await reset(ownerA);
  await submit(ownerA.siteId, review({ comment: "Great <b>bold</b> team and tidy work" }));
  const [item] = await readReviews(ownerA);

  await patch(ownerA, item.id, { reviewStatus: "approved" });
  const html = await homeHtml(ownerA);

  assert.ok(html.includes("Great &lt;b&gt;bold&lt;/b&gt; team and tidy work"));
  assert.ok(!html.includes("<b>bold</b>"));
});

test("deleting an approved review removes it from the site", async () => {
  await reset(ownerA);
  const body = review();
  await submit(ownerA.siteId, body);
  const [item] = await readReviews(ownerA);
  await patch(ownerA, item.id, { reviewStatus: "approved" });
  assert.ok((await homeHtml(ownerA)).includes(body.comment));

  const removed = await request(`/api/sites/${ownerA.siteId}/inquiries/${item.id}`, {
    method: "DELETE",
    cookie: ownerA.cookie,
  });

  assert.equal(removed.status, 200);
  assert.ok(!(await homeHtml(ownerA)).includes(body.comment));
  assert.equal((await readReviews(ownerA)).length, 0);
});

test("user B gets 404 on approve, hide and delete of user A's review", async () => {
  await reset(ownerA);
  await submit(ownerA.siteId, review());
  const [item] = await readReviews(ownerA);

  const approve = await patch(ownerA, item.id, { reviewStatus: "approved" }, ownerB.cookie);
  const hide = await patch(ownerA, item.id, { reviewStatus: "hidden" }, ownerB.cookie);
  const remove = await request(`/api/sites/${ownerA.siteId}/inquiries/${item.id}`, {
    method: "DELETE",
    cookie: ownerB.cookie,
  });

  assert.equal(approve.status, 404);
  assert.equal(hide.status, 404);
  assert.equal(remove.status, 404);
  assert.equal((await readReviews(ownerA))[0].reviewStatus, "pending");
});

test("the reviews tab lists only reviews, and the other kinds do not list them", async () => {
  await reset(ownerA);
  await submit(ownerA.siteId, review());
  await submit(ownerA.siteId, {
    name: "Sara Ali",
    phone: `010${randomInt(10_000_000, 99_999_999)}`,
    message: "I need a villa designed.",
    elapsedMs: 6000,
  });

  const reviews = await readReviews(ownerA, "review");
  const quotes = await readReviews(ownerA, "quote");

  assert.equal(reviews.length, 1);
  assert.equal(reviews[0].kind, "review");
  assert.equal(quotes.length, 1);
  assert.equal(quotes[0].kind, "quote");
});

test("a review status on a quote and a request status on a review give 400", async () => {
  await reset(ownerA);
  await submit(ownerA.siteId, review());
  await submit(ownerA.siteId, {
    name: "Sara Ali",
    phone: `010${randomInt(10_000_000, 99_999_999)}`,
    message: "I need a villa designed.",
    elapsedMs: 6000,
  });
  const [reviewItem] = await readReviews(ownerA, "review");
  const [quoteItem] = await readReviews(ownerA, "quote");

  assert.equal((await patch(ownerA, reviewItem.id, { status: "won" })).status, 400);
  assert.equal((await patch(ownerA, quoteItem.id, { reviewStatus: "approved" })).status, 400);
});
