import assert from "node:assert/strict";
import { test } from "node:test";
import { listTemplates } from "../../src/features/static-site-generator/site-templates/registry";
import { request } from "./client";

// The templates gallery is public: no sign-in, no AI, no database. The page and every preview
// render statically from the fixed demo content.

test("the gallery page is public and lists every template", async () => {
  const response = await request("/en/templates");

  assert.equal(response.status, 200);

  const html = await response.text();

  for (const template of listTemplates()) {
    assert.ok(html.includes(template.name), `missing template "${template.name}"`);
    assert.ok(html.includes(`/en/templates/${template.id}/preview`), `missing link to "${template.id}"`);
  }
});

test("every template opens its full preview without signing in", async () => {
  for (const template of listTemplates()) {
    const preview = await request(`/en/templates/${template.id}/preview`);

    assert.equal(preview.status, 200, template.id);

    const contentType = preview.headers.get("content-type") ?? "";
    assert.ok(contentType.includes("text/html"), template.id);

    const html = await preview.text();
    assert.ok(html.includes(`<base href="/en/templates/${template.id}/preview/en/">`), template.id);
    assert.ok(!html.includes("data-endpoint"), template.id);
  }
});

test("theme assets come from the preview catch-all", async () => {
  const asset = await request("/en/templates/agenvo/preview/assets/site.css");

  assert.equal(asset.status, 200);
  assert.ok((asset.headers.get("content-type") ?? "").includes("text/css"));
});

test("unknown template ids and files return 404", async () => {
  assert.equal((await request("/en/templates/nope/preview")).status, 404);
  assert.equal((await request("/en/templates/agenvo/preview/en/missing.html")).status, 404);
});
