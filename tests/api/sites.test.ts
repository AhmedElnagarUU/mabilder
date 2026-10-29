import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { deleteAllSites, generateWithoutAi, request, signUp } from "./client";
import {
  homeBlockIds,
  withHomeBlockHidden,
  withHomeBlocksSwapped,
  withHomeTitle,
} from "./content-shape";

type SiteBody = { site: { id: string; status: string; content: unknown } };

function briefFor(businessName: string, locale = "en") {
  return {
    businessName,
    industry: "Interior design",
    description: "A small interior design studio.",
    locale,
  };
}

const cookies: string[] = [];
let ownerCookie = "";
let otherCookie = "";
let siteId = "";
let siteContent: unknown;

async function readCode(response: Response): Promise<string> {
  return ((await response.json()) as { code: string }).code;
}

async function signUpUser(name: string): Promise<string> {
  const cookie = await signUp(name);
  cookies.push(cookie);
  return cookie;
}

async function createAndGenerate(cookie: string, brief: object): Promise<SiteBody["site"]> {
  const created = await request("/api/sites", { method: "POST", cookie, body: brief });
  assert.equal(created.status, 201, await created.clone().text());

  const { site } = (await created.json()) as SiteBody;
  const generated = await generateWithoutAi(site.id, cookie);
  assert.equal(generated.status, 200, await generated.clone().text());

  return ((await generated.json()) as SiteBody).site;
}

async function readPreview(id: string, cookie: string): Promise<string> {
  const preview = await request(`/preview/${id}/index.html`, { cookie });
  assert.equal(preview.status, 200);
  return preview.text();
}

function blockPosition(html: string, blockId: string): number {
  return html.indexOf(`<section data-block="${blockId}"`);
}

before(async () => {
  ownerCookie = await signUpUser("Q1 Owner");
  otherCookie = await signUpUser("Q1 Other");

  const site = await createAndGenerate(ownerCookie, briefFor("Q1 Owner Studio"));
  siteId = site.id;
  siteContent = site.content;
});

after(async () => {
  for (const cookie of cookies) {
    await deleteAllSites(cookie);
  }
});

test("generate builds a block site from the brief without AI (block plan M4; AI is disabled on the test server)", async () => {
  const site = (
    (await (await request(`/api/sites/${siteId}`, { cookie: ownerCookie })).json()) as SiteBody
  ).site;
  assert.equal(site.status, "ready");

  const html = await readPreview(siteId, ownerCookie);
  const ids = homeBlockIds(siteContent);
  assert.ok(ids.length >= 2, "the home page has fewer than 2 blocks");

  const positions = ids.map((id) => blockPosition(html, id));
  assert.ok(positions.every((position) => position >= 0), "a home block is missing from the preview");
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b), "home blocks are out of order");
});

test("a site created in Arabic renders right-to-left (i18n plan: site locale defaults to the app locale)", async () => {
  const cookie = await signUpUser("Q1 Arabic");
  const site = await createAndGenerate(cookie, briefFor("استوديو نور", "ar"));

  assert.ok((await readPreview(site.id, cookie)).includes('<html lang="ar" dir="rtl">'));
});

test("signed-out requests to site APIs get 401 unauthorized (CODE_RULES §7)", async () => {
  const calls = [
    { method: "GET", path: "/api/sites" },
    { method: "POST", path: "/api/sites", body: briefFor("Q1 Anonymous") },
    { method: "GET", path: `/api/sites/${siteId}` },
    { method: "PUT", path: `/api/sites/${siteId}/content`, body: siteContent },
    { method: "DELETE", path: `/api/sites/${siteId}` },
  ];

  for (const call of calls) {
    const response = await request(call.path, { method: call.method, body: call.body });
    assert.equal(response.status, 401, `${call.method} ${call.path}`);
    assert.equal(await readCode(response), "unauthorized");
  }

  assert.equal((await request(`/api/sites/${siteId}`, { cookie: ownerCookie })).status, 200);
});

test("signed-out preview gets 404 (auth plan §1: preview is owner-only)", async () => {
  assert.equal((await request(`/preview/${siteId}/index.html`)).status, 404);
  assert.equal(
    (await request(`/preview/${siteId}/index.html`, { cookie: ownerCookie })).status,
    200,
  );
});

test("user B gets 404 on user A's site, content and preview (CODE_RULES §7 owner check)", async () => {
  const intruderTitle = `Changed by user B ${randomUUID()}`;

  const read = await request(`/api/sites/${siteId}`, { cookie: otherCookie });
  assert.equal(read.status, 404);
  assert.equal(await readCode(read), "site_not_found");

  const save = await request(`/api/sites/${siteId}/content`, {
    method: "PUT",
    cookie: otherCookie,
    body: withHomeTitle(siteContent, intruderTitle),
  });
  assert.equal(save.status, 404);
  assert.equal(await readCode(save), "site_not_found");

  const remove = await request(`/api/sites/${siteId}`, { method: "DELETE", cookie: otherCookie });
  assert.equal(remove.status, 404);

  assert.equal((await request(`/preview/${siteId}/index.html`, { cookie: otherCookie })).status, 404);

  const list = (await (await request("/api/sites", { cookie: otherCookie })).json()) as {
    sites: { id: string }[];
  };
  assert.ok(!list.sites.some((site) => site.id === siteId), "user B lists user A's site");

  const ownerPreview = await request(`/preview/${siteId}/index.html`, { cookie: ownerCookie });
  assert.equal(ownerPreview.status, 200);
  assert.ok(!(await ownerPreview.text()).includes(intruderTitle), "user B changed user A's site");
});

test("a second site for the same account gets 409 site_exists (one website per account)", async () => {
  const second = await request("/api/sites", {
    method: "POST",
    cookie: ownerCookie,
    body: briefFor("Q1 Owner Second Studio"),
  });
  assert.equal(second.status, 409);
  assert.equal(await readCode(second), "site_exists");

  const otherFirst = await request("/api/sites", {
    method: "POST",
    cookie: otherCookie,
    body: briefFor("Q1 Other Studio"),
  });
  assert.equal(otherFirst.status, 201, "another account can still create its own site");
});

test("an invalid content body gets 400 invalid_request", async () => {
  const response = await request(`/api/sites/${siteId}/content`, {
    method: "PUT",
    cookie: ownerCookie,
    body: { ...(siteContent as object), locales: ["en", "ar"] },
  });

  assert.equal(response.status, 400);
  assert.equal(await readCode(response), "invalid_request");
});

test("a valid content save shows in the preview", async () => {
  const title = `Saved title ${randomUUID()}`;

  const save = await request(`/api/sites/${siteId}/content`, {
    method: "PUT",
    cookie: ownerCookie,
    body: withHomeTitle(siteContent, title),
  });
  assert.equal(save.status, 200, await save.clone().text());

  const preview = await request(`/preview/${siteId}/index.html`, { cookie: ownerCookie });
  assert.equal(preview.status, 200);
  assert.ok((await preview.text()).includes(title), "preview does not show the saved title");
});

test("saving a reordered home page changes the block order in the preview (block plan: reorder)", async () => {
  const [, first, second] = homeBlockIds(siteContent);

  const save = await request(`/api/sites/${siteId}/content`, {
    method: "PUT",
    cookie: ownerCookie,
    body: withHomeBlocksSwapped(siteContent, 1, 2),
  });
  assert.equal(save.status, 200, await save.clone().text());

  const html = await readPreview(siteId, ownerCookie);
  assert.ok(blockPosition(html, first) >= 0 && blockPosition(html, second) >= 0);
  assert.ok(blockPosition(html, second) < blockPosition(html, first), "blocks were not reordered");
});

test("saving a hidden block removes it from the preview (CODE_RULES §8: hidden blocks are not rendered)", async () => {
  const hiddenId = homeBlockIds(siteContent)[1];

  const save = await request(`/api/sites/${siteId}/content`, {
    method: "PUT",
    cookie: ownerCookie,
    body: withHomeBlockHidden(siteContent, hiddenId),
  });
  assert.equal(save.status, 200, await save.clone().text());

  const html = await readPreview(siteId, ownerCookie);
  assert.equal(blockPosition(html, hiddenId), -1, "the hidden block is still in the preview");
  assert.ok(blockPosition(html, homeBlockIds(siteContent)[0]) >= 0, "visible blocks disappeared");
});
