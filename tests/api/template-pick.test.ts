import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { buildSiteContent } from "../../src/features/site-creation/build-content";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { getTemplate, getTemplateDesign, listTemplates } from "../../src/features/static-site-generator/site-templates/registry";
import type { SiteContent } from "../../src/features/static-site-generator/site-content";
import { deleteAllSites, request, signUp } from "./client";

// Applying a template changes only theme + designs. No AI, no credits, no Pexels.

const cookies: string[] = [];
let ownerCookie = "";
let otherCookie = "";
let siteId = "";
let savedContent: SiteContent;

const brief = {
  businessName: "T4 Owner Studio",
  industry: "Interior design",
  description: "A small interior design studio.",
  locale: "en",
};

function pickTarget() {
  const template = listTemplates().find((candidate) => candidate.id !== savedContent.theme);
  assert.ok(template, "needs a second registered template");
  return template;
}

function propsOf(content: SiteContent): unknown {
  return content.pages.map((page) => page.blocks.map((block) => ({ id: block.id, props: block.props })));
}

function postTemplate(cookie: string | undefined, templateId: unknown, id = siteId) {
  return request(`/api/sites/${id}/template`, { method: "POST", cookie, body: { templateId } });
}

before(async () => {
  ownerCookie = await signUp("T4 Owner");
  otherCookie = await signUp("T4 Other");
  cookies.push(ownerCookie, otherCookie);

  const created = await request("/api/sites", { method: "POST", cookie: ownerCookie, body: brief });
  assert.equal(created.status, 201);
  siteId = ((await created.json()) as { site: { id: string } }).site.id;

  const saved = await request(`/api/sites/${siteId}/content`, {
    method: "PUT",
    cookie: ownerCookie,
    body: buildSiteContent(businessBriefSchema.parse(brief)),
  });
  assert.equal(saved.status, 200);
  savedContent = ((await saved.json()) as { site: { content: SiteContent } }).site.content;
});

after(async () => {
  for (const cookie of cookies) {
    await deleteAllSites(cookie);
  }
});

test("owner applies a template: theme and designs change, props stay", async () => {
  const target = pickTarget();
  const response = await postTemplate(ownerCookie, target.id);
  assert.equal(response.status, 200, await response.clone().text());

  const { site } = (await response.json()) as { site: { content: SiteContent } };

  assert.equal(site.content.theme, target.id);
  assert.deepEqual(propsOf(site.content), propsOf(savedContent));

  for (const block of site.content.pages.flatMap((page) => page.blocks)) {
    assert.equal(block.design, getTemplateDesign(getTemplate(target.id), block.type), block.type);
  }

  const html = await (await request(`/preview/${siteId}/index.html`, { cookie: ownerCookie })).text();
  const hero = site.content.pages[0].blocks.find((block) => block.type === "hero");
  assert.ok(hero && html.includes(`data-block="${hero.id}" data-design="${hero.design}"`));
});

test("an unknown template id or a missing body gets 400", async () => {
  for (const templateId of ["does-not-exist", 42, undefined]) {
    const response = await postTemplate(ownerCookie, templateId);
    assert.equal(response.status, 400, String(templateId));
  }
});

test("signed-out gets 401 and user B gets 404", async () => {
  assert.equal((await postTemplate(undefined, pickTarget().id)).status, 401);
  assert.equal((await postTemplate(otherCookie, pickTarget().id)).status, 404);
});

test("owner preview renders their own content as html; user B and signed-out get 404", async () => {
  const target = listTemplates()[0];
  const path = `/api/sites/${siteId}/template-preview/${target.id}`;

  const preview = await request(path, { cookie: ownerCookie });
  assert.equal(preview.status, 200);
  assert.ok((preview.headers.get("content-type") ?? "").includes("text/html"));

  const html = await preview.text();
  assert.ok(html.includes(brief.businessName));
  assert.ok(html.includes(`<base href="/api/sites/${siteId}/template-preview/${target.id}/`));
  assert.ok(!html.includes("data-endpoint"));

  assert.equal((await request(path, { cookie: otherCookie })).status, 404);
  assert.equal((await request(path)).status, 404);
  assert.equal((await request(`/api/sites/${siteId}/template-preview/does-not-exist`, { cookie: ownerCookie })).status, 404);
});
