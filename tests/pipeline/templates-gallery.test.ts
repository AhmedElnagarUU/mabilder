import assert from "node:assert/strict";
import { test } from "node:test";
import { demoContent, heroTitleOf } from "../../src/features/templates-gallery/demo/demo-content";
import { getTemplate } from "../../src/features/static-site-generator/site-templates/registry";
import { getTheme } from "../../src/features/static-site-generator/themes/registry";
import {
  findPreviewAsset,
  findPreviewPage,
  listPreviewParams,
  previewLocales,
  previewTemplateIds,
} from "../../src/features/templates-gallery/preview";

test("the demo content parses as site content with both locales and every main section", () => {
  assert.deepEqual([...demoContent.locales].sort(), ["ar", "en"]);
  assert.equal(demoContent.pages[0].slug, "index");

  const types = new Set<string>(demoContent.pages.flatMap((page) => page.blocks.map((block) => block.type)));

  for (const type of [
    "hero",
    "intro",
    "services",
    "projects",
    "stats",
    "process",
    "testimonials",
    "cta",
    "contact",
    "faq",
  ]) {
    assert.ok(types.has(type), `missing block type "${type}"`);
  }
});

test("the Arabic hero title is Arabic text", () => {
  assert.match(heroTitleOf("ar"), /[\u0600-\u06FF]/);
  assert.doesNotMatch(heroTitleOf("en"), /[\u0600-\u06FF]/);
});

test("every template renders the demo in en and ar without broken output", () => {
  assert.deepEqual(previewLocales(), ["en", "ar"]);

  for (const id of previewTemplateIds()) {
    for (const locale of previewLocales()) {
      for (const file of [[], [`${locale}`, "about.html"], [`${locale}`, "index.html"]]) {
        const page = findPreviewPage(id, locale, file);
        assert.ok(page, `${id} ${locale} ${file.join("/")}`);

        for (const leak of ["undefined", "[object Object]", "data-endpoint"]) {
          assert.ok(!page.html.includes(leak), `${id} ${locale} leaks "${leak}"`);
        }
      }
    }
  }
});

test("preview pages resolve internal links through the base href", () => {
  const page = findPreviewPage("agenvo", "en", ["en", "about.html"]);

  assert.ok(page);
  assert.ok(page.html.includes('<base href="/en/templates/agenvo/preview/en/">'));
});

test("the root redirect file and unknown files are not served", () => {
  // renderSite also outputs the redirect file "index.html" at the root; it must stay 404.
  assert.equal(findPreviewPage("agenvo", "en", ["index.html"]), null);
  assert.equal(findPreviewPage("agenvo", "en", ["en", "missing.html"]), null);
  assert.equal(findPreviewPage("agenvo", "en", ["ar", "about.html"]), null);
  assert.equal(findPreviewPage("nope", "en", []), null);
  // A foreign string does not pass the Locale validation of the preview route.
  assert.equal(findPreviewPage("agenvo", "no" as never, []), null);
});

test("theme assets are served through the same catch-all", async () => {
  const theme = getTheme(getTemplate("agenvo").shell);
  const asset = theme.assets.find((candidate) => candidate.endsWith(".css"));

  assert.ok(asset);
  const found = await findPreviewAsset("agenvo", "en", ["assets", asset]);

  assert.ok(found);
  assert.equal(found.contentType, "text/css; charset=utf-8");
  assert.equal(await findPreviewAsset("agenvo", "en", ["assets", "missing.css"]), null);
  assert.equal(await findPreviewAsset("agenvo", "en", ["en", "about.html"]), null);
});

test("preview params only produce valid route files", () => {
  const params = listPreviewParams();

  for (const param of params) {
    assert.ok(previewTemplateIds().includes(param.id));
    assert.ok(previewLocales().includes(param.locale));

    if (param.file.length > 0) {
      assert.ok(
        param.file[0] === param.locale || param.file[0] === "assets",
        `bad file prefix: ${param.file.join("/")}`,
      );
    }
  }
});
