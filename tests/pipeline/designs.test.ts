import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { blockSchema } from "../../src/features/static-site-generator/blocks/catalog";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import {
  siteContentSchema,
  type SiteContent,
} from "../../src/features/static-site-generator/site-content";
import { composeFor, thinBrief } from "./samples";

const fixtureDirectory = path.join(process.cwd(), "tests", "pipeline", "fixtures");

function readFixture(name: string): string {
  return readFileSync(path.join(fixtureDirectory, name), "utf8");
}

function renderToHtml(content: SiteContent): string {
  return renderSite(content)
    .map((file) => `### ${file.fileName}\n${file.html}`)
    .join("\n");
}

function stripDataDesign(html: string): string {
  return html.replace(/ data-design="[^"]*"/g, "");
}

test("old content with variant loads as designs and renders the same HTML", () => {
  const legacy = JSON.parse(readFixture("legacy-site.json")) as unknown;
  const content = siteContentSchema.parse(legacy);

  for (const page of content.pages) {
    for (const block of page.blocks) {
      assert.match(block.design, /^agenvo\//);
      assert.equal("variant" in block, false);
    }
  }

  const expected = readFixture("legacy-site.html");
  assert.equal(stripDataDesign(renderToHtml(content)), expected);
});

test("old content with variant and new content with design render byte-identical HTML", () => {
  const legacy = siteContentSchema.parse(JSON.parse(readFixture("legacy-site.json")));
  const current = composeFor(thinBrief);

  assert.equal(renderToHtml(legacy), renderToHtml(current));
});

test("a design from another category is rejected by the block schema", () => {
  const content = composeFor(thinBrief);
  const hero = content.pages[0].blocks.find((block) => block.type === "hero");

  assert.ok(hero);
  const result = blockSchema.safeParse({ ...hero, design: "agenvo/services-columns" });

  assert.equal(result.success, false);
});

test("swapping to another design of the same category keeps props and renders the new root", () => {
  const content = composeFor(thinBrief);
  const page = content.pages[0];
  const hero = page.blocks.find((block) => block.type === "hero");

  assert.ok(hero);
  const swapped = blockSchema.parse({ ...hero, design: "agenvo/hero-page" });
  const swappedContent = siteContentSchema.parse({
    ...content,
    pages: [{ ...page, blocks: [swapped] }],
  });
  const html = renderSite(swappedContent)[0].html;

  assert.deepEqual(swapped.props, hero.props);
  assert.ok(html.includes(`data-block="${hero.id}"`));
  assert.ok(html.includes('data-design="agenvo/hero-page"'));
});
