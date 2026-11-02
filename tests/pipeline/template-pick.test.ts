import assert from "node:assert/strict";
import { test } from "node:test";
import { applyTemplate } from "../../src/features/site-editor/apply-template";
import { changeBlockDesign } from "../../src/features/site-editor/content-ops";
import { restoreLook } from "../../src/features/site-editor/restore-look";
import { applyTemplateBodySchema } from "../../src/features/site-editor/template-service";
import { getDesignsForCategory } from "../../src/features/static-site-generator/designs/registry";
import { listTemplates } from "../../src/features/static-site-generator/site-templates/registry";
import { composeFor, richBrief, richProjects } from "./samples";

const content = composeFor(richBrief, richProjects, ["en"]);

function otherTemplateId(): string {
  const other = listTemplates().find((template) => template.id !== content.theme);
  assert.ok(other, "needs a second registered template");
  return other.id;
}

test("restoreLook puts back the old theme and designs after a template pick", () => {
  const picked = applyTemplate(content, otherTemplateId());

  assert.notEqual(picked.theme, content.theme);
  assert.deepEqual(restoreLook(picked, content), content);
});

test("restoreLook keeps edits made after the pick", () => {
  const picked = applyTemplate(content, otherTemplateId());
  const hero = picked.pages[0].blocks.find((block) => block.type === "hero");
  assert.ok(hero);

  const moved = { ...picked, pages: [{ ...picked.pages[0], blocks: [...picked.pages[0].blocks].reverse() }, ...picked.pages.slice(1)] };
  const restored = restoreLook(moved, content);

  assert.deepEqual(
    restored.pages[0].blocks.map((block) => block.id),
    moved.pages[0].blocks.map((block) => block.id),
  );
  assert.equal(restored.theme, content.theme);
});

test("restoreLook restores a design changed by the template, not one changed alone before", () => {
  const hero = content.pages[0].blocks.find((block) => block.type === "hero");
  assert.ok(hero);

  const alternative = getDesignsForCategory("hero").find((design) => design.id !== hero.design);
  assert.ok(alternative);

  const customised = changeBlockDesign(content, content.pages[0].id, hero.id, alternative.id);
  const picked = applyTemplate(customised, otherTemplateId());

  assert.deepEqual(restoreLook(picked, customised), customised);
});

test("the template request accepts a registered id and rejects anything else", () => {
  assert.ok(applyTemplateBodySchema.safeParse({ templateId: otherTemplateId() }).success);
  assert.ok(!applyTemplateBodySchema.safeParse({ templateId: "does-not-exist" }).success);
  assert.ok(!applyTemplateBodySchema.safeParse({}).success);
});
