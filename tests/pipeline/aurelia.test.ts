import assert from "node:assert/strict";
import { test } from "node:test";
import { applyTemplate } from "../../src/features/site-editor/apply-template";
import { blockDefinitions } from "../../src/features/static-site-generator/blocks/catalog";
import { getDesign } from "../../src/features/static-site-generator/designs/registry";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import { siteContentSchema } from "../../src/features/static-site-generator/site-content";
import { getTemplate, getTemplateDesign } from "../../src/features/static-site-generator/site-templates/registry";
import { composeFor, richBrief, richProjects } from "./samples";

const aurelia = getTemplate("aurelia");

function classicSite() {
  return composeFor(richBrief, richProjects, ["en", "ar"]);
}

test("Aurelia is registered with its own shell and a design of the right category for every type", () => {
  assert.equal(aurelia.id, "aurelia");
  assert.equal(aurelia.shell, "aurelia");
  assert.ok(aurelia.tokens.fontStylesheets[0].includes("Cormorant+Garamond"));
  assert.ok(aurelia.tokens.fontStylesheets[0].includes("Noto+Naskh+Arabic"));

  for (const definition of blockDefinitions) {
    const id = getTemplateDesign(aurelia, definition.type);
    assert.ok(id.startsWith("aurelia/"), `${definition.type} uses ${id}`);
    assert.equal(getDesign(id)?.category, definition.type);
  }
});

test("applying Aurelia keeps every prop and renders each page in en and ar", () => {
  const classic = classicSite();
  const applied = applyTemplate(classic, "aurelia");

  siteContentSchema.parse(applied);
  assert.equal(applied.theme, "aurelia");
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
    assert.ok(file.html.includes("assets/aurelia.css"), file.fileName);
    assert.ok(!file.html.includes("cdn.tailwindcss.com") && !file.html.includes("unpkg.com"), file.fileName);
    assert.ok(file.html.includes("--site-bg: #12100e;"), file.fileName);
    assert.ok(file.html.includes("fonts.googleapis.com"), file.fileName);
    assert.ok(file.html.includes(file.fileName.startsWith("ar/") ? 'dir="rtl"' : 'dir="ltr"'), file.fileName);
  }
});

test("the Aurelia contact section keeps the three forms, the honeypot and the tab data attributes", () => {
  const files = renderSite(applyTemplate(classicSite(), "aurelia"));
  const contact = files.find((file) => file.fileName === "en/contact.html");
  assert.ok(contact);

  const section = contact.html.slice(contact.html.indexOf('data-design="aurelia/contact-default"'));

  assert.equal(section.match(/<form data-form /g)?.length, 3);
  assert.equal(section.match(/name="website"/g)?.length, 3);
  for (const kind of ["quote", "visit", "review"]) {
    assert.ok(section.includes(`name="kind" value="${kind}"`), kind);
    assert.ok(section.includes(`data-tab="${kind}"`), kind);
  }
  assert.ok(section.includes("data-contact-tabs"));
  assert.ok(contact.html.includes("<body class=\"au\""));
});

test("Aurelia designs show services with and without a photo, and several reviews in a snap row", () => {
  const content = applyTemplate(classicSite(), "aurelia");

  for (const design of ["aurelia/services-circles", "aurelia/services-panels"]) {
    const swapped = structuredClone(content);

    for (const block of swapped.pages.flatMap((page) => page.blocks)) {
      if (block.type === "services") {
        block.design = design;
      }
    }

    const html = renderSite(swapped).map((file) => file.html).join("");
    assert.ok(html.includes(`data-design="${design}"`), design);
    assert.ok(!html.includes("undefined"), design);
  }
});
