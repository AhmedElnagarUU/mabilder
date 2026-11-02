import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { applyTemplate } from "../../src/features/site-editor/apply-template";
import { blockDefinitions } from "../../src/features/static-site-generator/blocks/catalog";
import { designs, getDesign } from "../../src/features/static-site-generator/designs/registry";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import { siteContentSchema } from "../../src/features/static-site-generator/site-content";
import { getTemplate, getTemplateDesign } from "../../src/features/static-site-generator/site-templates/registry";
import { composeFor, richBrief, richProjects } from "./samples";

const atelier = getTemplate("atelier");
const atelierDesigns = designs.filter((design) => design.id.startsWith("atelier/"));

function classicSite() {
  return composeFor(richBrief, richProjects, ["en", "ar"]);
}

test("Atelier is registered with its own shell, fonts and a design of the right category for every type", () => {
  assert.equal(atelier.id, "atelier");
  assert.equal(atelier.shell, "atelier");
  assert.ok(atelier.tokens.fontStylesheets[0].includes("Playfair+Display"));
  assert.ok(atelier.tokens.fontStylesheets[0].includes("Amiri"));
  assert.ok(atelier.mood.ar.length > 0);

  for (const definition of blockDefinitions) {
    const id = getTemplateDesign(atelier, definition.type);
    assert.ok(id.startsWith("atelier/"), `${definition.type} uses ${id}`);
    assert.equal(getDesign(id)?.category, definition.type);
  }
});

test("hero, services, projects, stats and testimonials have two Atelier designs each", () => {
  for (const category of ["hero", "services", "projects", "stats", "testimonials"] as const) {
    const count = atelierDesigns.filter((design) => design.category === category).length;
    assert.ok(count >= 2, `${category} has ${count} Atelier designs`);
  }
});

test("applying Atelier keeps every prop and renders each page in en and ar", () => {
  const classic = classicSite();
  const applied = applyTemplate(classic, "atelier");

  siteContentSchema.parse(applied);
  assert.equal(applied.theme, "atelier");
  assert.deepEqual(
    applied.pages.map((page) => page.blocks.map((block) => block.props)),
    classic.pages.map((page) => page.blocks.map((block) => block.props)),
  );

  const files = renderSite(applied);
  const pages = files.filter((file) => file.fileName.endsWith(".html") && file.fileName !== "index.html");

  assert.ok(pages.some((file) => file.fileName.startsWith("en/")));
  assert.ok(pages.some((file) => file.fileName.startsWith("ar/")));

  for (const file of pages) {
    assert.ok(!file.html.includes("undefined"), file.fileName);
    assert.ok(!file.html.includes("[object Object]"), file.fileName);
    assert.ok(file.html.includes("assets/atelier.css"), file.fileName);
    assert.ok(!/<script[^>]+src="https?:/.test(file.html), file.fileName);
    assert.ok(!file.html.includes("cdn.tailwindcss.com") && !file.html.includes("unpkg.com"), file.fileName);
    assert.ok(file.html.includes("--site-bg: #f6f3ee;"), file.fileName);
    assert.ok(file.html.includes("fonts.googleapis.com"), file.fileName);
    assert.ok(file.html.includes('<body class="at"'), file.fileName);
    assert.ok(file.html.includes(file.fileName.startsWith("ar/") ? 'dir="rtl"' : 'dir="ltr"'), file.fileName);

    for (const match of file.html.matchAll(/data-design="([^"]+)"/g)) {
      assert.ok(match[1].startsWith("atelier/"), `${file.fileName}: ${match[1]}`);
    }
  }
});

test("the Atelier contact section keeps the three forms, the honeypot and the tab data attributes", () => {
  const files = renderSite(applyTemplate(classicSite(), "atelier"));
  const contact = files.find((file) => file.fileName === "en/contact.html");
  assert.ok(contact);

  const section = contact.html.slice(contact.html.indexOf('data-design="atelier/contact-default"'));

  assert.equal(section.match(/<form data-form /g)?.length, 3);
  assert.equal(section.match(/name="website"/g)?.length, 3);
  for (const kind of ["quote", "visit", "review"]) {
    assert.ok(section.includes(`name="kind" value="${kind}"`), kind);
    assert.ok(section.includes(`data-tab="${kind}"`), kind);
  }
  assert.ok(section.includes("data-contact-tabs"));
});

test("Atelier signature: italic last word in titles, side labels, hairline steps, logical CSS only", () => {
  const files = renderSite(applyTemplate(classicSite(), "atelier"));
  const home = files.find((file) => file.fileName === "en/index.html");
  const css = readFileSync("src/features/static-site-generator/themes/atelier/assets/atelier.css", "utf8");
  assert.ok(home);

  assert.ok(/<h1 class="at-hero-title[^"]*">[^<]*<em>/.test(home.html) || home.html.includes("<em>"));
  assert.ok(home.html.includes('class="at-nav-side at-nav-start"'));
  assert.ok(css.includes("clip-path: polygon"));
  assert.ok(css.includes("writing-mode: vertical-rl"));
  assert.ok(css.includes("@media (prefers-reduced-motion: reduce)"));
  assert.ok(css.includes(":focus-visible"));
  assert.ok(!/(^|[\s;{])(margin|padding)-(left|right)\s*:/m.test(css));
  assert.ok(!/(^|[\s;{])(left|right)\s*:/m.test(css));
  assert.ok(!/(^|[\s;{])text-align\s*:\s*(left|right)/m.test(css));
});

test("Atelier alt designs render when their section exists: hero centered, services list, projects carousel, stats aside", () => {
  const content = applyTemplate(classicSite(), "atelier");
  const swaps = [
    "atelier/hero-centered",
    "atelier/services-list",
    "atelier/projects-carousel",
    "atelier/stats-aside",
  ];

  for (const design of swaps) {
    const swapped = structuredClone(content);
    const category = getDesign(design)?.category;
    assert.ok(category, design);

    for (const block of swapped.pages.flatMap((page) => page.blocks)) {
      if (block.type === category) {
        block.design = design;
      }
    }

    const html = renderSite(swapped).map((file) => file.html).join("");
    assert.ok(html.includes(`data-design="${design}"`), design);
    assert.ok(!html.includes("undefined"), design);
    assert.ok(!html.includes("[object Object]"), design);
  }
});
