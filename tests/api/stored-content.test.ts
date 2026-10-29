import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { SiteModel } from "../../src/features/site-creation/model";
import { connectToDatabase, disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { deleteAllSites, request, signUp } from "./client";

type SiteBody = { site: { id: string; status: string; content: unknown } };

const oldShapeContent = {
  siteName: "Old Studio",
  pages: { home: { hero: { title: "Old template hero" } } },
};

let cookie = "";
let siteId = "";

before(async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");

  cookie = await signUp("Q1 Old Content");
  const created = await request("/api/sites", {
    method: "POST",
    cookie,
    body: { businessName: "Old Studio", industry: "Interior design", description: "A studio." },
  });
  assert.equal(created.status, 201);
  siteId = ((await created.json()) as SiteBody).site.id;

  await connectToDatabase();
  await SiteModel.updateOne({ _id: siteId }, { content: oldShapeContent, status: "ready" });
});

after(async () => {
  await deleteAllSites(cookie);
  await disconnectFromDatabase();
});

test("a site whose stored content has the old shape loads without 500 and needs generating", async () => {
  const site = await request(`/api/sites/${siteId}`, { cookie });
  assert.equal(site.status, 200, await site.clone().text());

  const body = (await site.json()) as SiteBody;
  assert.equal(body.site.content, null);
  assert.equal(body.site.status, "draft");

  const list = await request("/api/sites", { cookie });
  assert.equal(list.status, 200);

  for (const path of ["/en/dashboard", `/en/edit/${siteId}`]) {
    assert.equal((await request(path, { cookie })).status, 200, path);
  }
});
