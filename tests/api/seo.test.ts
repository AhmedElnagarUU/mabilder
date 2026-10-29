import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { buildSiteContent } from "../../src/features/site-creation/build-content";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { deleteAllSites, request, signUp } from "./client";

type SiteBody = { site: { id: string; content: { pages: { id: string }[] } } };

function briefFor(businessName: string) {
  return {
    businessName,
    industry: "Interior design",
    description: "A small interior design studio.",
    locale: "en",
  };
}

const cookies: string[] = [];
let ownerCookie = "";
let otherCookie = "";
let siteId = "";
let indexPageId = "";

async function readCode(response: Response): Promise<string> {
  return ((await response.json()) as { code: string }).code;
}

async function signUpUser(name: string): Promise<string> {
  const cookie = await signUp(name);
  cookies.push(cookie);
  return cookie;
}

// Generate calls the AI, so the content comes from the rules-only composition instead.
async function createWithContent(cookie: string, brief: object): Promise<SiteBody["site"]> {
  const created = await request("/api/sites", { method: "POST", cookie, body: brief });
  assert.equal(created.status, 201, await created.clone().text());

  const { site } = (await created.json()) as SiteBody;
  const saved = await request(`/api/sites/${site.id}/content`, {
    method: "PUT",
    cookie,
    body: buildSiteContent(businessBriefSchema.parse(brief)),
  });
  assert.equal(saved.status, 200, await saved.clone().text());

  return ((await saved.json()) as SiteBody).site;
}

async function readPreview(cookie: string): Promise<string> {
  const preview = await request(`/preview/${siteId}/index.html`, { cookie });
  assert.equal(preview.status, 200);
  return preview.text();
}

function seoFor(pageId: string, title: string, description: string) {
  return { id: pageId, meta: { en: { title, description } } };
}

function saveSeo(cookie: string | undefined, pages: unknown) {
  return request(`/api/sites/${siteId}/seo`, { method: "PUT", cookie, body: { pages } });
}

before(async () => {
  ownerCookie = await signUpUser("S1 Owner");
  otherCookie = await signUpUser("S1 Other");

  const site = await createWithContent(ownerCookie, briefFor("S1 Owner Studio"));
  siteId = site.id;
  indexPageId = site.content.pages[0].id;
});

after(async () => {
  for (const cookie of cookies) {
    await deleteAllSites(cookie);
  }
});

test("an edited page title and description appear in the preview <title> and meta description (S1 acceptance)", async () => {
  const title = `SEO title ${randomUUID()}`;
  const description = `SEO description ${randomUUID()}`;

  const save = await saveSeo(ownerCookie, [seoFor(indexPageId, title, description)]);
  assert.equal(save.status, 200, await save.clone().text());

  const html = await readPreview(ownerCookie);
  assert.ok(html.includes(`<title>${title}</title>`), "the preview <title> did not change");
  assert.ok(
    html.includes(`name="description" content="${description}"`),
    "the preview meta description did not change",
  );
});

test("a title over 120 characters gets 400 invalid_request (S1 validation)", async () => {
  const response = await saveSeo(ownerCookie, [seoFor(indexPageId, "x".repeat(121), "Short.")]);

  assert.equal(response.status, 400);
  assert.equal(await readCode(response), "invalid_request");
});

test("a locale the site does not have gets 400 invalid_request (S1: only the site's locales)", async () => {
  const response = await saveSeo(ownerCookie, [
    {
      id: indexPageId,
      meta: {
        en: { title: "English title", description: "English description." },
        fr: { title: "French title", description: "French description." },
      },
    },
  ]);

  assert.equal(response.status, 400);
  assert.equal(await readCode(response), "invalid_request");
});

test("user B gets 404 on user A's SEO settings and the preview is unchanged (CODE_RULES §7 owner check)", async () => {
  const intruderTitle = `Changed by user B ${randomUUID()}`;

  const response = await saveSeo(otherCookie, [seoFor(indexPageId, intruderTitle, "Intruder.")]);

  assert.equal(response.status, 404);
  assert.equal(await readCode(response), "site_not_found");
  assert.ok(!(await readPreview(ownerCookie)).includes(intruderTitle), "user B changed user A's SEO");
});

test("signed-out SEO save gets 401 unauthorized (CODE_RULES §7)", async () => {
  const response = await saveSeo(undefined, [seoFor(indexPageId, "Anonymous", "Anonymous.")]);

  assert.equal(response.status, 401);
  assert.equal(await readCode(response), "unauthorized");
});
