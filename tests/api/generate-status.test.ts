import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
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

// Runs the real service against the _test database; the AI is a stub (tests never call it).

setMinIntervalMs(0);

const ownerId = `q1-generate-${randomUUID()}`;

after(async () => {
  for (const site of await listSites(ownerId)) {
    await deleteSite(ownerId, site.id);
  }

  await disconnectFromDatabase();
});

test("a failed generate leaves the site with status \"error\" and the reason (block plan: retry flow)", async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");

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
