import assert from "node:assert/strict";
import { test } from "node:test";
import { getDesignsForCategory } from "../../src/features/static-site-generator/designs/registry";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import { siteContentSchema, type SiteContent } from "../../src/features/static-site-generator/site-content";
import { canChangeDesign, currentDesignId } from "../../src/features/site-editor/block-designs";
import { changeBlockDesign } from "../../src/features/site-editor/content-ops";
import { composeFor, richBrief, richProjects } from "./samples";

function bilingualSite(): SiteContent {
  return composeFor(richBrief, richProjects, ["en", "ar"]);
}

function withoutDesign(block: object): object {
  const copy: Record<string, unknown> = { ...block };
  delete copy.design;
  return copy;
}

function sectionHtml(content: SiteContent, fileName: string, blockId: string): string {
  const html = renderSite(content).find((file) => file.fileName === fileName)?.html ?? "";
  const start = html.indexOf(`<section data-block="${blockId}"`);

  assert.ok(start >= 0, `block ${blockId} missing in ${fileName}`);
  const rest = html.slice(start + 1);
  const next = [rest.indexOf("<section data-block="), rest.indexOf("<footer")].filter(
    (index) => index >= 0,
  );

  return next.length > 0 ? html.slice(start, start + 1 + Math.min(...next)) : html.slice(start);
}

test("changing a design keeps props, id, order and hidden exactly the same", () => {
  const content = bilingualSite();

  for (const page of content.pages) {
    for (const block of page.blocks) {
      for (const design of getDesignsForCategory(block.type)) {
        const next = changeBlockDesign(content, page.id, block.id, design.id);
        const nextPage = next.pages.find((candidate) => candidate.id === page.id);

        assert.ok(nextPage);
        assert.deepEqual(
          nextPage.blocks.map(withoutDesign),
          page.blocks.map(withoutDesign),
        );
        assert.equal(nextPage.blocks.find((candidate) => candidate.id === block.id)?.design, design.id);
        siteContentSchema.parse(next);
      }
    }
  }
});

test("changeBlockDesign ignores unknown designs and designs of another category", () => {
  const content = bilingualSite();
  const page = content.pages[0];
  const hero = page.blocks.find((block) => block.type === "hero");

  assert.ok(hero);
  assert.equal(changeBlockDesign(content, page.id, hero.id, "agenvo/nope"), content);
  assert.equal(changeBlockDesign(content, page.id, hero.id, "agenvo/services-columns"), content);
  assert.equal(changeBlockDesign(content, page.id, hero.id, hero.design), content);
});

test("every design of every category renders the real props in en and ar with the new data-design", () => {
  const content = bilingualSite();
  const seen = new Set<string>();

  for (const page of content.pages) {
    for (const block of page.blocks) {
      for (const design of getDesignsForCategory(block.type)) {
        const next = changeBlockDesign(content, page.id, block.id, design.id);
        seen.add(design.id);

        for (const locale of content.locales) {
          const section = sectionHtml(next, `${locale}/${page.slug}.html`, block.id);

          assert.ok(
            section.startsWith(`<section data-block="${block.id}" data-design="${design.id}"`),
            `${design.id} root in ${locale}`,
          );
          assert.ok(!section.includes("undefined"), `${design.id} ${locale}: undefined`);
          assert.ok(!section.includes("[object Object]"), `${design.id} ${locale}: [object Object]`);
        }
      }
    }
  }

  assert.ok(seen.size > 0);
});

test("a design that is not in the block category falls back to the default design in the gallery", () => {
  const content = bilingualSite();
  const hero = content.pages[0].blocks.find((block) => block.type === "hero");

  assert.ok(hero);
  const broken = { ...hero, design: "agenvo/services-columns" } as typeof hero;

  assert.equal(currentDesignId(broken), getDesignsForCategory("hero")[0].id);
  assert.equal(canChangeDesign(hero), getDesignsForCategory("hero").length > 1);
});
