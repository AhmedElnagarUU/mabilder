import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { applyTemplate, applyTemplateDefinition } from "../../src/features/site-editor/apply-template";
import { imageNeedsOf, listImageSlots, slotPath } from "../../src/features/site-creation/images/slots";
import {
  blockDefinitions,
  getBlockDefinition,
  type Block,
} from "../../src/features/static-site-generator/blocks/catalog";
import { servicesBlock } from "../../src/features/static-site-generator/blocks/services";
import { designs, getDesign } from "../../src/features/static-site-generator/designs/registry";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import { siteContentSchema, type SiteContent } from "../../src/features/static-site-generator/site-content";
import { renderTemplateHead } from "../../src/features/static-site-generator/site-templates/head";
import * as registry from "../../src/features/static-site-generator/site-templates/registry";
import {
  getTemplate,
  getTemplateDesign,
  isTemplateId,
  listTemplates,
} from "../../src/features/static-site-generator/site-templates/registry";
import type { SiteTemplate } from "../../src/features/static-site-generator/site-templates/types";
import { composeFor, richBrief, richProjects } from "./samples";

const classic = getTemplate("agenvo");

// Test-only second template: not registered in the app.
const testTemplate: SiteTemplate = {
  id: "test-second",
  name: "Second",
  mood: { en: "Test", ar: "تجربة" },
  tokens: {
    ...classic.tokens,
    bg: "#101010",
    accent: "#c9a962",
    fontStylesheets: [...classic.tokens.fontStylesheets, "https://fonts.googleapis.com/css2?family=Inter&display=swap"],
  },
  shell: "agenvo",
  designs: { hero: "agenvo/hero-text-only", services: "agenvo/services-list", projects: "agenvo/projects-grid" },
};

function bilingualSite(): SiteContent {
  return composeFor(richBrief, richProjects, ["en", "ar"]);
}

function allBlocks(content: SiteContent): Block[] {
  return content.pages.flatMap((page) => page.blocks);
}

function withoutDesign(content: SiteContent): unknown {
  return {
    ...content,
    theme: undefined,
    pages: content.pages.map((page) => ({
      ...page,
      blocks: page.blocks.map((block) => ({ ...block, design: undefined })),
    })),
  };
}

test("the Classic template is registered, is the fallback, and uses designs of the right category", () => {
  assert.equal(classic.id, "agenvo");
  assert.equal(classic.name, "Classic");
  assert.equal(getTemplate("nope"), classic);
  assert.equal(isTemplateId("agenvo"), true);
  assert.equal(isTemplateId("nope"), false);

  for (const template of listTemplates()) {
    assert.ok(template.mood.en && template.mood.ar);

    for (const definition of blockDefinitions) {
      const designId = getTemplateDesign(template, definition.type);
      assert.equal(getDesign(designId)?.category, definition.type, `${template.id} ${definition.type}`);
    }
  }
});

test("a template without a design for a type uses the base design", () => {
  assert.equal(getTemplateDesign(testTemplate, "hero"), "agenvo/hero-text-only");
  assert.equal(getTemplateDesign(testTemplate, "faq"), classic.designs.faq);
  const wrong = { ...testTemplate, designs: { hero: "agenvo/services-list" } };
  assert.equal(getTemplateDesign(wrong, "hero"), classic.designs.hero);
});

test("applyTemplate sets theme and designs; props, ids, order, hidden, facts, nav and footer stay", () => {
  const content = bilingualSite();
  const hidden = content.pages[0].blocks[2];
  hidden.hidden = true;

  const next = applyTemplateDefinition(content, testTemplate);

  assert.equal(next.theme, "test-second");
  assert.deepEqual(withoutDesign(next), withoutDesign(content));
  assert.deepEqual(next.facts, content.facts);
  assert.deepEqual(next.nav, content.nav);
  assert.deepEqual(next.footer, content.footer);

  for (const block of allBlocks(next)) {
    assert.equal(block.design, getTemplateDesign(testTemplate, block.type));
  }

  assert.equal(content.theme, "agenvo", "the input is not mutated");
});

test("applying A, then B, then A gives back the start (blocks on template defaults)", () => {
  const start = applyTemplate(bilingualSite(), "agenvo");
  const there = applyTemplateDefinition(start, testTemplate);
  const back = applyTemplate(there, "agenvo");

  assert.notDeepEqual(there, start);
  assert.deepEqual(back, start);
  siteContentSchema.parse(back);
});

test("an unknown template returns the content unchanged", () => {
  const content = bilingualSite();

  assert.equal(applyTemplate(content, "does-not-exist"), content);
});

test("content with an unknown theme is rejected; Classic is accepted", () => {
  const content = bilingualSite();

  assert.equal(siteContentSchema.safeParse(content).success, true);
  assert.equal(siteContentSchema.safeParse({ ...content, theme: "does-not-exist" }).success, false);
});

test("Classic tokens are the values in the shell's site.css and add nothing to the page", () => {
  const css = readFileSync(
    path.join(process.cwd(), "src", "features", "static-site-generator", "themes", "agenvo", "assets", "site.css"),
    "utf8",
  );
  const tokens = classic.tokens;
  const expected = [
    `--site-bg: ${tokens.bg};`,
    `--site-ink: ${tokens.ink};`,
    `--site-accent: ${tokens.accent};`,
    `--site-font-display: ${tokens.fontDisplay};`,
    `--site-font-body: ${tokens.fontBody};`,
    `--site-radius: ${tokens.radius};`,
    `--site-space: ${tokens.space};`,
  ];

  for (const line of expected) {
    assert.ok(css.includes(line), `site.css lacks ${line}`);
  }

  assert.equal(renderTemplateHead(classic), "");
});

test("another template writes only its changed variables and new font links as the :root style", () => {
  const head = renderTemplateHead(testTemplate);

  assert.match(head, /<style>:root \{ --site-bg: #101010; --site-accent: #c9a962; \}<\/style>/);
  assert.ok(head.includes("family=Inter"));
  assert.equal(head.match(/<link /g)?.length, 1, "only the new font stylesheet is added");
  assert.ok(!head.includes("--site-ink"));
});

test("Classic renders without a token style, other templates write it in every page head", (t) => {
  const classicFiles = renderSite(bilingualSite());
  assert.ok(classicFiles.every((file) => !file.html.includes(":root {")));

  t.mock.method(registry, "getTemplate", (id: string) => (id === testTemplate.id ? testTemplate : classic));
  const pages = renderSite(applyTemplateDefinition(bilingualSite(), testTemplate)).filter(
    (file) => file.fileName !== "index.html",
  );

  assert.ok(pages.length > 0);

  for (const file of pages) {
    const head = file.html.slice(0, file.html.indexOf("</head>"));
    assert.ok(head.includes("--site-bg: #101010;"), file.fileName);
    assert.ok(head.indexOf("assets/site.css") < head.indexOf("--site-bg: #101010;"), "tokens come after site.css");
  }
});

test("services render with and without an image", () => {
  const content = bilingualSite();
  const services = allBlocks(content).find((block) => block.type === "services");
  assert.ok(services);

  const withImage = structuredClone(content);
  const target = allBlocks(withImage).find((block) => block.id === services.id);
  assert.ok(target && target.type === "services");

  for (const locale of withImage.locales) {
    target.props[locale]!.items[0].image = {
      src: "https://images.pexels.com/1-l.jpg",
      alt: "Service",
      credit: { name: "Someone", url: "https://www.pexels.com/photo/1/" },
    };
  }

  const parsed = siteContentSchema.parse(withImage);

  for (const candidate of [content, parsed]) {
    for (const file of renderSite(candidate)) {
      assert.ok(!file.html.includes("undefined"), file.fileName);
      assert.ok(!file.html.includes("[object Object]"), file.fileName);
    }
  }
});

test("services fixtures: full has images, minimal has none", () => {
  assert.ok(servicesBlock.fixtures.full.items.every((item) => "image" in item));
  assert.ok(servicesBlock.fixtures.minimal.items.every((item) => !("image" in item)));
});

test("image needs are listed once per block type and cover what every design reads", () => {
  const needs = Object.fromEntries(
    blockDefinitions.map((definition) => [definition.type, imageNeedsOf(definition.type).map(slotPath)]),
  );

  assert.deepEqual(needs.hero, ["image"]);
  assert.deepEqual(needs.intro, ["images"]);
  assert.deepEqual(needs["feature-split"], ["image"]);
  assert.deepEqual(needs.services, ["items[].image"]);
  assert.equal(listImageSlots().length, 4);

  for (const design of designs) {
    const kind = getBlockDefinition(design.category)?.kind;

    if (kind !== "copy") {
      continue;
    }

    for (const slot of design.imageSlots) {
      assert.ok(needs[design.category].includes(slot.path), `${design.id} reads ${slot.path}`);
    }
  }
});
