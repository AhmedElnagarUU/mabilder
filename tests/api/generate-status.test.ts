import assert from "node:assert/strict";
import { after, test } from "node:test";
import { setMinIntervalMs } from "../../src/features/site-creation/generation/rate-limit";
import {
  createSite,
  deleteSite,
  generateContent,
  getSite,
  listSites,
} from "../../src/features/site-creation/service";
import { disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { stubModel } from "../pipeline/stub-model";
import { request, signUp } from "./client";

// Runs the real service against the _test database; the AI is a stub (tests never call it).

setMinIntervalMs(0);

let ownerId = "";

async function signUpAndReadId(): Promise<string> {
  const cookie = await signUp("Q1 Generate");
  const response = await request("/api/auth/get-session", { cookie });
  return ((await response.json()) as { user: { id: string } }).user.id;
}

after(async () => {
  if (ownerId) {
    for (const site of await listSites(ownerId)) {
      await deleteSite(ownerId, site.id);
    }
  }

  await disconnectFromDatabase();
});

test("a failed generate leaves the site with status \"error\" and the reason (block plan: retry flow)", async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");

  ownerId = await signUpAndReadId();

  const created = await createSite(ownerId, {
    businessName: "Q1 Failing Studio",
    industry: "Interior design",
    description: "A studio.",
  });
  assert.ok(created.ok);

  const stub = stubModel(() => ({ blocks: {} }));

  await assert.rejects(
    generateContent(ownerId, created.site.id, () => stub.model),
    /AI copy is invalid/,
  );

  const site = await getSite(ownerId, created.site.id);
  assert.equal(site?.status, "error");
  assert.match(site?.error ?? "", /AI copy is invalid/);
  assert.equal(site?.content, null);
});
