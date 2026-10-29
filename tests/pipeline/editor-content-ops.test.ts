import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { blockDefinitions } from "../../src/features/static-site-generator/blocks/catalog";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import { siteContentSchema, type SiteContent } from "../../src/features/static-site-generator/site-content";
import {
  editableFields,
  hideBlock,
  moveBlock,
  pageFileName,
  restoreBlock,
  updateBlockImage,
  updateBlockProp,
} from "../../src/features/site-editor/content-ops";
import { fieldLabelKey } from "../../src/features/site-editor/field-groups";
import { resolveFocusId, sectionNav, visibleSections } from "../../src/features/site-editor/section-nav";
import { composeFor, richBrief, richProjects } from "./samples";

function blockIdsOfPage(content: SiteContent, pageId: string): string[] {
  const page = content.pages.find((candidate) => candidate.id === pageId);
  assert.ok(page, `page ${pageId} missing`);
  return page.blocks.map((block) => block.id);
}

function renderedBlockIds(html: string): string[] {
  return [...html.matchAll(/<section\b[^>]*\bdata-block="([^"]*)"/g)].map((match) => match[1]);
}

function messageKeys(locale: string): Set<string> {
  const file = path.join(process.cwd(), "src", "messages", `${locale}.json`);
  const value = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
  const keys = new Set<string>();

  function walk(node: unknown, prefix: string): void {
    if (typeof node !== "object" || node === null || Array.isArray(node)) {
      keys.add(prefix);
      return;
    }

    for (const [key, child] of Object.entries(node)) {
      walk(child, prefix ? `${prefix}.${key}` : key);
    }
  }

  walk(value, "");
  return keys;
}

function collectStringKeys(schema: unknown, keys: Set<string>, key: string): void {
  const node = schema as { type?: string; unwrap?: () => unknown; element?: unknown; shape?: Record<string, unknown> };

  if (node.type === "string") {
    keys.add(key);
    return;
  }

  if (node.type === "optional" && node.unwrap) {
    collectStringKeys(node.unwrap(), keys, key);
    return;
  }

  if (node.type === "array") {
    collectStringKeys(node.element, keys, key);
    return;
  }

  if (node.type === "object" && node.shape) {
    for (const [childKey, child] of Object.entries(node.shape)) {
      collectStringKeys(child, keys, childKey);
    }
  }
}

test("moveBlock up and down changes the order and the result still passes siteContentSchema", () => {
  const content = composeFor(richBrief, richProjects, ["en", "ar"]);
  const page = content.pages[0];
  const original = blockIdsOfPage(content, page.id);
  const movedDown = moveBlock(content, page.id, original[1], "down");

  assert.deepEqual(blockIdsOfPage(movedDown, page.id), [original[0], original[2], original[1], ...original.slice(3)]);
  assert.equal(siteContentSchema.safeParse(movedDown).success, true);

  const movedBack = moveBlock(movedDown, page.id, original[1], "up");
  assert.deepEqual(blockIdsOfPage(movedBack, page.id), original);
  assert.equal(siteContentSchema.safeParse(movedBack).success, true);
});

test("moveBlock skips hidden blocks", () => {
  const content = composeFor(richBrief, richProjects);
  const page = content.pages[0];
  const original = blockIdsOfPage(content, page.id);
  const hidden = hideBlock(content, page.id, original[2]);
  const before = hidden.pages[0].blocks
    .filter((block) => !block.hidden)
    .map((block) => block.id);
  const moved = moveBlock(hidden, page.id, original[3], "up");
  const visible = moved.pages[0].blocks
    .filter((block) => !block.hidden)
    .map((block) => block.id);

  assert.deepEqual(visible, [original[0], original[3], original[1], ...original.slice(4)]);
  assert.equal(visible.indexOf(original[3]) < visible.indexOf(original[1]), true);
  assert.notDeepEqual(visible, before);
});

test("the hero cannot be moved or hidden, and no block can be moved above it", () => {
  const content = composeFor(richBrief, richProjects);
  const page = content.pages[0];
  const heroId = page.blocks[0].id;
  const secondId = page.blocks[1].id;

  assert.deepEqual(moveBlock(content, page.id, heroId, "up"), content);
  assert.deepEqual(moveBlock(content, page.id, heroId, "down"), content);
  assert.deepEqual(hideBlock(content, page.id, heroId), content);
  assert.deepEqual(moveBlock(content, page.id, secondId, "up"), content);
});

test("hideBlock then restoreBlock gives back the original content", () => {
  const content = composeFor(richBrief, richProjects);
  const page = content.pages[0];
  const blockId = page.blocks[2].id;
  const hidden = hideBlock(content, page.id, blockId);

  assert.notDeepEqual(hidden, content);
  assert.equal(hidden.pages[0].blocks[2].hidden, true);
  assert.deepEqual(restoreBlock(hidden, page.id, blockId), content);
});

test("updateBlockProp changes only that locale's value at that path", () => {
  const content = composeFor(richBrief, richProjects, ["en", "ar"]);
  const page = content.pages[1];
  const block = page.blocks[1];
  const originalEn = (block.props.en as Record<string, unknown>).title;
  const originalAr = (block.props.ar as Record<string, unknown>).title;
  const updated = updateBlockProp(content, page.id, block.id, "en", ["title"], "A new title");

  assert.equal((updated.pages[1].blocks[1].props.en as Record<string, unknown>).title, "A new title");
  assert.equal((updated.pages[1].blocks[1].props.ar as Record<string, unknown>).title, originalAr);
  assert.notEqual(originalEn, "A new title");

  updated.pages.forEach((updatedPage, pageIndex) => {
    updatedPage.blocks.forEach((updatedBlock, blockIndex) => {
      if (updatedPage.id === page.id && updatedBlock.id === block.id) {
        return;
      }

      assert.deepEqual(updatedBlock, content.pages[pageIndex].blocks[blockIndex]);
    });
  });

  assert.equal(siteContentSchema.safeParse(updated).success, true);
});

test("updateBlockImage changes only the image src for that locale", () => {
  const content = composeFor(richBrief, richProjects, ["en", "ar"]);
  const page = content.pages[0];
  const block = page.blocks.find((candidate) => candidate.type === "hero");

  assert.ok(block);
  const props = block.props.en as Record<string, unknown>;
  props.image = { src: "https://images.example.com/original.jpg", alt: "Original" };

  const field = editableFields(block, "en").find((candidate) => candidate.kind === "image");
  assert.ok(field);

  const url = "https://images.example.com/replacement.jpg";
  const updated = updateBlockImage(content, page.id, block.id, "en", field.path, url);
  const updatedBlock = updated.pages[0].blocks.find((candidate) => candidate.id === block.id);

  assert.ok(updatedBlock);
  assert.deepEqual((updatedBlock.props.en as Record<string, unknown>).image, {
    src: url,
    alt: "Original",
  });
  assert.equal((updatedBlock.props.ar as Record<string, unknown>).image, undefined);
  assert.equal(siteContentSchema.safeParse(updated).success, true);
});

test("editableFields never returns href, image src, id, type or variant paths", () => {
  const content = composeFor(richBrief, richProjects, ["en", "ar"]);
  const forbidden = new Set(["href", "src", "alt", "credit", "id", "type", "variant"]);

  for (const page of content.pages) {
    for (const block of page.blocks) {
      for (const locale of content.locales) {
        for (const field of editableFields(block, locale)) {
          for (const segment of field.path) {
            assert.equal(forbidden.has(String(segment)), false, `${block.type} ${field.path.join(".")}`);
          }
        }
      }
    }
  }
});

test("for a fact block editableFields returns only eyebrow, title, body and link-label paths", () => {
  const content = composeFor(richBrief, richProjects);
  const factBlocks = content.pages
    .flatMap((page) => page.blocks)
    .filter((block) => block.type === "stats" || block.type === "projects" || block.type === "clients");

  assert.ok(factBlocks.length > 0);

  for (const block of factBlocks) {
    for (const field of editableFields(block, "en")) {
      const first = String(field.path[0]);
      const allowed = first === "eyebrow" || first === "title" || first === "body" || field.kind === "linkLabel";
      assert.equal(allowed, true, `${block.type} ${field.path.join(".")}`);
    }
  }
});

test("after moveBlock and hideBlock renderSite has the new order and no hidden section", () => {
  const content = composeFor(richBrief, richProjects);
  const page = content.pages[0];
  const original = blockIdsOfPage(content, page.id);
  const moved = moveBlock(content, page.id, original[1], "down");
  const hidden = hideBlock(moved, page.id, original[3]);
  const visible = hidden.pages[0].blocks.filter((block) => !block.hidden).map((block) => block.id);
  const file = renderSite(hidden).find((candidate) => candidate.fileName === pageFileName(hidden, page.slug, "en"));

  assert.ok(file);
  assert.deepEqual(renderedBlockIds(file.html), visible);
  assert.equal(renderedBlockIds(file.html).includes(original[3]), false);
});

test("every string key in a catalog block schema has an editor.fields label in en and ar", () => {
  const keys = new Set<string>();

  for (const definition of blockDefinitions) {
    collectStringKeys(definition.schema, keys, definition.type);
  }

  for (const locale of ["en", "ar"]) {
    const available = messageKeys(locale);

    for (const key of keys) {
      assert.equal(available.has(`editor.fields.${key}`), true, `${locale}: editor.fields.${key}`);
    }
  }
});

test("fieldLabelKey uses the last string segment of the path", () => {
  assert.equal(fieldLabelKey({ path: ["items", 2, "title"], kind: "text", value: "" }), "title");
  assert.equal(fieldLabelKey({ path: ["cta", "label"], kind: "linkLabel", value: "" }), "label");
});

test("section navigation numbers only visible sections and skips hidden ones for prev and next", () => {
  const content = composeFor(richBrief, richProjects);
  const page = content.pages[0];
  const all = page.blocks.map((block) => block.id);
  assert.ok(all.length >= 4);

  const hiddenId = all[2];
  const hidden = hideBlock(content, page.id, hiddenId);
  const blocks = hidden.pages[0].blocks;
  const visible = visibleSections(blocks).map((block) => block.id);

  assert.equal(visible.includes(hiddenId), false);
  assert.equal(visible.length, all.length - 1);

  const first = sectionNav(blocks, visible[0]);
  assert.deepEqual(first, { number: 1, total: visible.length, prevId: null, nextId: visible[1] });

  const beforeHidden = sectionNav(blocks, all[1]);
  assert.equal(beforeHidden?.nextId, all[3]);
  assert.equal(sectionNav(blocks, all[3])?.prevId, all[1]);
  assert.equal(sectionNav(blocks, visible[visible.length - 1])?.nextId, null);
  assert.equal(sectionNav(blocks, hiddenId), null);
});

test("resolveFocusId keeps a visible selection and falls back to the first visible section", () => {
  const content = composeFor(richBrief, richProjects);
  const page = content.pages[0];
  const ids = page.blocks.map((block) => block.id);
  const hidden = hideBlock(content, page.id, ids[1]).pages[0].blocks;

  assert.equal(resolveFocusId(hidden, ids[3]), ids[3]);
  assert.equal(resolveFocusId(hidden, ids[1]), ids[0]);
  assert.equal(resolveFocusId(hidden, null), ids[0]);
  assert.equal(resolveFocusId([], null), null);
});