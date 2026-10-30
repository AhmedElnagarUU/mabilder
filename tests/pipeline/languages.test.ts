import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSiteContent } from "../../src/features/site-creation/build-content";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import { thinBrief } from "./samples";

function render(extra: object) {
  const content = buildSiteContent(businessBriefSchema.parse({ ...thinBrief, ...extra }));
  return { content, files: renderSite(content) };
}

test("an Arabic-only brief builds an ar site rendered right-to-left", () => {
  const { content, files } = render({ languages: { locales: ["ar"], defaultLocale: "ar" } });

  assert.deepEqual(content.locales, ["ar"]);
  assert.equal(content.defaultLocale, "ar");
  assert.ok(files.length > 0);

  for (const file of files) {
    assert.match(file.html, /<html[^>]*\sdir="rtl"/, file.fileName);
  }
});

test("a two-language brief writes en/ and ar/ files and redirects the root to the default", () => {
  const { content, files } = render({ languages: { locales: ["en", "ar"], defaultLocale: "ar" } });
  const names = files.map((file) => file.fileName);

  assert.deepEqual(content.locales, ["en", "ar"]);
  assert.equal(content.defaultLocale, "ar");
  assert.ok(names.includes("en/index.html"));
  assert.ok(names.includes("ar/index.html"));

  const root = files.find((file) => file.fileName === "index.html");
  assert.ok(root);
  assert.match(root.html, /url=ar\/index\.html/);

  const english = files.find((file) => file.fileName === "en/index.html");
  assert.ok(english);
  assert.match(english.html, /hreflang="ar"/);
});

test("an old brief with only locale 'ar' still builds an Arabic site", () => {
  const { content } = render({ locale: "ar" });

  assert.deepEqual(content.locales, ["ar"]);
  assert.equal(content.defaultLocale, "ar");
});

test("an old brief with no language builds the default English site", () => {
  const { content } = render({});

  assert.deepEqual(content.locales, ["en"]);
  assert.equal(content.defaultLocale, "en");
});

test("languages that repeat a locale or miss the default are rejected", () => {
  const bad = [
    { locales: ["en", "en"], defaultLocale: "en" },
    { locales: ["en"], defaultLocale: "ar" },
    { locales: [], defaultLocale: "en" },
  ];

  for (const languages of bad) {
    assert.equal(businessBriefSchema.safeParse({ ...thinBrief, languages }).success, false);
  }
});
