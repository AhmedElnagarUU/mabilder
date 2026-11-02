import assert from "node:assert/strict";
import { test } from "node:test";
import { applyTemplate } from "../../src/features/site-editor/apply-template";
import { blockDefinitions } from "../../src/features/static-site-generator/blocks/catalog";
import { designs, getDesign } from "../../src/features/static-site-generator/designs/registry";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import { siteContentSchema } from "../../src/features/static-site-generator/site-content";
import { getTemplate, getTemplateDesign } from "../../src/features/static-site-generator/site-templates/registry";
import { composeFor, richBrief, richProjects } from "./samples";

const arhitect = getTemplate("arhitect");
const arhitectDesigns = designs.filter((design) => design.id.startsWith("arhitect/"));

function classicSite() {
  return composeFor(richBrief, richProjects, ["en", "ar"]);
}

test("Arhitect is registered with its own shell and a design of the right category for every type", () => {
  assert.equal(arhitect.id, "arhitect");
  assert.equal(arhitect.shell, "arhitect");
  assert.ok(arhitect.tokens.fontStylesheets[0].includes("Archivo"));
  assert.ok(arhitect.tokens.fontStylesheets[0].includes("Cairo"));
  assert.ok(arhitect.mood.ar.length > 0);

  for (const definition of blockDefinitions) {
    const id = getTemplateDesign(arhitect, definition.type);
    assert.ok(id.startsWith("arhitect/"), `${definition.type} uses ${id}`);
    assert.equal(getDesign(id)?.category, definition.type);
  }
});

test("hero, services, projects, stats and testimonials have two Arhitect designs each", () => {
  for (const category of ["hero", "services", "projects", "stats", "testimonials"] as const) {
    const count = arhitectDesigns.filter(
      (design) => design.id.startsWith("arhitect/") && design.category === category,
    ).length;
    assert.ok(count >= 2, `${category} has ${count} Arhitect designs`);
  }
});

test("applying Arhitect keeps every prop and renders each page in en and ar", () => {
  const classic = classicSite();
  const applied = applyTemplate(classic, "arhitect");

  siteContentSchema.parse(applied);
  assert.equal(applied.theme, "arhitect");
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
    assert.ok(file.html.includes("assets/arhitect.css"), file.fileName);
    assert.ok(!file.html.includes("cdn.tailwindcss.com") && !file.html.includes("unpkg.com"), file.fileName);
    assert.ok(file.html.includes("--site-bg: #0a0a0a;"), file.fileName);
    assert.ok(file.html.includes("--site-accent: #e5322d;"), file.fileName);
    assert.ok(file.html.includes("fonts.googleapis.com"), file.fileName);
    assert.ok(file.html.includes('<body class="ar"'), file.fileName);
    assert.ok(file.html.includes(file.fileName.startsWith("ar/") ? 'dir="rtl"' : 'dir="ltr"'), file.fileName);

    for (const match of file.html.matchAll(/data-design="([^"]+)"/g)) {
      assert.ok(match[1].startsWith("arhitect/"), `${file.fileName}: ${match[1]}`);
    }
  }
});

test("the Arhitect contact section keeps the three forms, the honeypot and the tab data attributes", () => {
  const files = renderSite(applyTemplate(classicSite(), "arhitect"));
  const contact = files.find((file) => file.fileName === "en/contact.html");
  assert.ok(contact);

  const section = contact.html.slice(contact.html.indexOf('data-design="arhitect/contact-split"'));

  assert.equal(section.match(/<form data-form /g)?.length, 3);
  assert.equal(section.match(/name="website"/g)?.length, 3);
  for (const kind of ["quote", "visit", "review"]) {
    assert.ok(section.includes(`name="kind" value="${kind}"`), kind);
    assert.ok(section.includes(`data-tab="${kind}"`), kind);
  }
  assert.ok(section.includes("data-contact-tabs"));
});

test("Arhitect alt designs render when their section exists: hero split, project rows, giant stat, services rows", () => {
  const content = applyTemplate(classicSite(), "arhitect");
  const swaps = ["arhitect/hero-split", "arhitect/projects-rows", "arhitect/stats-giant", "arhitect/services-rows"];

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
  }
});
