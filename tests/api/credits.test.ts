import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { CreditUseModel } from "../../src/features/credits/model";
import { DAILY_CREDITS } from "../../src/features/credits/plans";
import { getBalance, spend } from "../../src/features/credits/service";
import { buildSiteContent } from "../../src/features/site-creation/build-content";
import { setMinIntervalMs } from "../../src/features/site-creation/generation/rate-limit";
import { rewriteContent } from "../../src/features/site-creation/rewrite";
import {
  createSite,
  deleteSite,
  getSite,
  saveContent,
} from "../../src/features/site-creation/service";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { getBlockDefinition } from "../../src/features/static-site-generator/blocks/catalog";
import type { SiteContent } from "../../src/features/static-site-generator/site-content";
import { disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { markedAnswer, stubModel } from "../pipeline/stub-model";
import { request, signUp } from "./client";

// Runs the real services and routes against the _test database; the AI is a stub, and the
// HTTP tests only reach paths that stop before the AI call.

setMinIntervalMs(0);

const HOUR_MS = 60 * 60 * 1000;
const brief = {
  businessName: "C1 Credits Studio",
  industry: "Interior design",
  description: "A small interior design studio.",
  locale: "en",
};

const ownerIds: string[] = [];
let ownerCookie = "";
let otherCookie = "";
let ownerId = "";
let siteId = "";
let content: SiteContent;

async function signUpAndReadId(name: string): Promise<{ cookie: string; id: string }> {
  const cookie = await signUp(name);
  const response = await request("/api/auth/get-session", { cookie });
  const { user } = (await response.json()) as { user: { id: string } };
  ownerIds.push(user.id);
  return { cookie, id: user.id };
}

function copyBlockIds(): string[] {
  return content.pages[0].blocks
    .filter((block) => getBlockDefinition(block.type)?.kind === "copy")
    .map((block) => block.id);
}

function factBlockIds(): string[] {
  return content.pages[0].blocks
    .filter((block) => getBlockDefinition(block.type)?.kind === "fact")
    .map((block) => block.id);
}

async function seedUse(owner: string, cost: number, hoursAgo: number): Promise<void> {
  await CreditUseModel.create({
    ownerId: owner,
    cost,
    reason: "seed",
    createdAt: new Date(Date.now() - hoursAgo * HOUR_MS),
  });
}

before(async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");

  const owner = await signUpAndReadId("C1 Owner");
  ownerCookie = owner.cookie;
  ownerId = owner.id;
  otherCookie = (await signUpAndReadId("C1 Other")).cookie;

  const created = await createSite(ownerId, brief);
  assert.ok(created.ok);
  siteId = created.site.id;

  content = buildSiteContent(businessBriefSchema.parse(brief));
  const saved = await saveContent(ownerId, siteId, content);
  assert.ok(saved?.ok);
});

after(async () => {
  await deleteSite(ownerId, siteId);
  await CreditUseModel.deleteMany({ ownerId: { $in: ownerIds } });
  await disconnectFromDatabase();
});

test("the 21st credit in 24 hours is refused and credits used 25 hours ago do not count", async () => {
  const { id } = await signUpAndReadId("C1 Window");
  await seedUse(id, 5, 25);

  assert.equal((await getBalance(id)).used, 0);

  for (let count = 0; count < DAILY_CREDITS; count += 1) {
    assert.equal((await spend(id, 1, "test")).ok, true, `credit ${count + 1} was refused`);
  }

  const refused = await spend(id, 1, "test");
  assert.equal(refused.ok, false);

  const balance = await getBalance(id);
  assert.equal(balance.used, DAILY_CREDITS);
  assert.equal(balance.left, 0);
  assert.ok(balance.nextResetAt && new Date(balance.nextResetAt) > new Date());
});

test("two parallel spends cannot both pass when only one credit is left", async () => {
  const { id } = await signUpAndReadId("C1 Parallel");
  await seedUse(id, DAILY_CREDITS - 1, 1);

  const results = await Promise.all([spend(id, 1, "test"), spend(id, 1, "test")]);

  assert.ok(results.filter((result) => result.ok).length <= 1);
  assert.ok((await getBalance(id)).used <= DAILY_CREDITS);
});

test("a rewrite changes only the chosen copy blocks and charges one credit per copy block", async () => {
  const { id } = await signUpAndReadId("C1 Rewrite");
  const target = await createSite(id, { ...brief, businessName: "C1 Rewrite Studio" });
  assert.ok(target.ok);
  assert.ok((await saveContent(id, target.site.id, content))?.ok);

  const [chosen, untouched] = copyBlockIds();
  const stub = stubModel(() => markedAnswer(content, "AI"));
  const result = await rewriteContent(
    id,
    target.site.id,
    { pageId: content.pages[0].id, blockIds: [chosen, ...factBlockIds()], instruction: "shorter" },
    () => stub.model,
  );

  assert.ok(result && result.ok);
  assert.equal(result.balance.used, 1);

  const page = result.site.content?.pages[0];
  assert.match(JSON.stringify(page?.blocks.find((block) => block.id === chosen)?.props), /AI:/);
  assert.deepEqual(
    page?.blocks.find((block) => block.id === untouched),
    content.pages[0].blocks.find((block) => block.id === untouched),
  );
  assert.deepEqual(
    page?.blocks.filter((block) => factBlockIds().includes(block.id)),
    content.pages[0].blocks.filter((block) => factBlockIds().includes(block.id)),
  );

  await deleteSite(id, target.site.id);
});

test("a failed or invalid AI answer charges nothing and leaves the content unchanged", async () => {
  const { id } = await signUpAndReadId("C1 Failing");
  const target = await createSite(id, { ...brief, businessName: "C1 Failing Studio" });
  assert.ok(target.ok);
  assert.ok((await saveContent(id, target.site.id, content))?.ok);

  const invalid = stubModel(() => ({ blocks: {} }));
  const request1 = { pageId: content.pages[0].id, blockIds: copyBlockIds().slice(0, 2) };

  await assert.rejects(rewriteContent(id, target.site.id, request1, () => invalid.model), /invalid/);

  const failing = stubModel(() => {
    throw new Error("model down");
  });
  await assert.rejects(rewriteContent(id, target.site.id, request1, () => failing.model));

  assert.equal((await getBalance(id)).used, 0);
  assert.deepEqual(
    (await getSite(id, target.site.id))?.content,
    JSON.parse(JSON.stringify(content)),
  );

  await deleteSite(id, target.site.id);
});

test("GET /api/credits returns the balance and needs a session", async () => {
  assert.equal((await request("/api/credits")).status, 401);

  const response = await request("/api/credits", { cookie: otherCookie });
  assert.equal(response.status, 200);

  const body = (await response.json()) as Record<string, unknown>;
  assert.deepEqual(Object.keys(body).sort(), ["left", "limit", "nextResetAt", "used"]);
  assert.equal(body.limit, DAILY_CREDITS);
  assert.equal(body.left, DAILY_CREDITS);
  assert.equal(body.used, 0);
  assert.equal(body.nextResetAt, null);
});

test("rewrite route: 401 signed out, 404 other user, 400 without copy blocks, 429 without credits", async () => {
  const path = `/api/sites/${siteId}/rewrite`;
  const body = { pageId: content.pages[0].id, blockIds: copyBlockIds().slice(0, 1) };

  assert.equal((await request(path, { method: "POST", body })).status, 401);
  assert.equal((await request(path, { method: "POST", cookie: otherCookie, body })).status, 404);

  const factsOnly = { pageId: content.pages[0].id, blockIds: factBlockIds() };
  const noCopy = await request(path, { method: "POST", cookie: ownerCookie, body: factsOnly });
  assert.equal(noCopy.status, 400);
  assert.equal(((await noCopy.json()) as { code: string }).code, "no_copy_blocks");

  const tooLong = { ...body, instruction: "x".repeat(201) };
  assert.equal((await request(path, { method: "POST", cookie: ownerCookie, body: tooLong })).status, 400);

  await seedUse(ownerId, DAILY_CREDITS, 1);
  const exhausted = await request(path, { method: "POST", cookie: ownerCookie, body });
  assert.equal(exhausted.status, 429);

  const exhaustedBody = (await exhausted.json()) as { code: string; nextResetAt: string };
  assert.equal(exhaustedBody.code, "credits_exhausted");
  assert.ok(new Date(exhaustedBody.nextResetAt) > new Date());
  assert.equal((await getBalance(ownerId)).used, DAILY_CREDITS);
});
