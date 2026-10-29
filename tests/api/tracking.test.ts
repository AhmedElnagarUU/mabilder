import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { buildSiteContent } from "../../src/features/site-creation/build-content";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { deleteAllSites, request, signUp } from "./client";

const brief = {
  businessName: "Q1 Tracking Studio",
  industry: "Interior design",
  description: "A small interior design studio.",
};
const ga4Id = "G-TRACK12345";

let cookie = "";
let otherCookie = "";
let siteId = "";

function putTracking(body: unknown, withCookie = cookie): Promise<Response> {
  return request(`/api/sites/${siteId}/tracking`, { method: "PUT", cookie: withCookie, body });
}

async function readPreview(): Promise<string> {
  const preview = await request(`/preview/${siteId}/index.html`, { cookie });
  assert.equal(preview.status, 200);
  return preview.text();
}

before(async () => {
  cookie = await signUp("Q1 Tracking Owner");
  otherCookie = await signUp("Q1 Tracking Other");

  const created = await request("/api/sites", { method: "POST", cookie, body: brief });
  assert.equal(created.status, 201, await created.clone().text());
  siteId = ((await created.json()) as { site: { id: string } }).site.id;

  // Generate calls the AI, so the content comes from the rules-only composition instead.
  const saved = await request(`/api/sites/${siteId}/content`, {
    method: "PUT",
    cookie,
    body: buildSiteContent(businessBriefSchema.parse(brief)),
  });
  assert.equal(saved.status, 200, await saved.clone().text());
});

after(async () => {
  await deleteAllSites(cookie);
  await deleteAllSites(otherCookie);
});

test("invalid tracking IDs return 400 invalid_request with field info", async () => {
  const response = await putTracking({ ga4Id: "not-an-id" });
  assert.equal(response.status, 400);

  const body = (await response.json()) as { code: string; errors: { path: string }[] };
  assert.equal(body.code, "invalid_request");
  assert.equal(body.errors[0].path, "ga4Id");
});

test("valid IDs are saved and appear in the preview head; clearing removes them", async () => {
  const saved = await putTracking({ ga4Id });
  assert.equal(saved.status, 200, await saved.clone().text());

  let html = await readPreview();
  assert.ok(html.slice(0, html.indexOf("</head>")).includes(ga4Id), "GA4 id is not in the head");

  const site = await request(`/api/sites/${siteId}`, { cookie });
  const body = (await site.json()) as { site: { tracking: { ga4Id?: string } } };
  assert.equal(body.site.tracking.ga4Id, ga4Id);

  const cleared = await putTracking({ ga4Id: "" });
  assert.equal(cleared.status, 200);

  html = await readPreview();
  assert.ok(!html.includes(ga4Id), "GA4 id is still in the preview");
  assert.ok(!html.includes("googletagmanager"), "GA4 script is still in the preview");
});

test("saving content keeps the tracking snippet", async () => {
  await putTracking({ ga4Id });

  const content = buildSiteContent(businessBriefSchema.parse(brief));
  const saved = await request(`/api/sites/${siteId}/content`, { method: "PUT", cookie, body: content });
  assert.equal(saved.status, 200);

  assert.ok((await readPreview()).includes(ga4Id), "re-render dropped the tracking snippet");
});

test("another user gets 404 and signed-out gets 401", async () => {
  assert.equal((await putTracking({ ga4Id }, otherCookie)).status, 404);
  assert.equal((await request(`/api/sites/${siteId}/tracking`, { method: "PUT", body: {} })).status, 401);
});
