import assert from "node:assert/strict";
import { test } from "node:test";
import { computeSiteHealth } from "../../src/features/site-creation/site-health";
import type { SiteContent } from "../../src/features/static-site-generator/site-content";
import { composeFor, richBrief } from "./samples";

const noTracking = {};

function cloneContent(): SiteContent {
  return structuredClone(composeFor(richBrief));
}

function visibleSectionCount(content: SiteContent): number {
  return content.pages.reduce(
    (total, page) => total + page.blocks.filter((block) => !block.hidden).length,
    0,
  );
}

test("counts pages and sections of a composed site", () => {
  const content = cloneContent();
  const health = computeSiteHealth(content, noTracking, 0);

  assert.equal(health.pages, content.pages.length);
  assert.equal(health.sections, visibleSectionCount(content));
  assert.ok(health.sections >= health.pages);
});

test("hidden sections are not counted, and a page with every section hidden is not a page", () => {
  const content = cloneContent();
  const before = computeSiteHealth(content, noTracking, 0);
  const lastPage = content.pages[content.pages.length - 1];
  const hiddenCount = lastPage.blocks.filter((block) => !block.hidden).length;

  lastPage.blocks.forEach((block) => {
    block.hidden = true;
  });

  const after = computeSiteHealth(content, noTracking, 0);

  assert.equal(after.pages, before.pages - 1);
  assert.equal(after.sections, before.sections - hiddenCount);
});

test("a page is SEO ready only with a description of 50+ characters in every site language", () => {
  const content = composeFor(richBrief, [], ["en", "ar"]);
  const [first, second] = content.pages;

  first.meta.en!.description = "x".repeat(50);
  first.meta.ar!.description = "y".repeat(50);
  second.meta.en!.description = "x".repeat(50);
  second.meta.ar!.description = "y".repeat(49);
  content.pages.slice(2).forEach((page) => {
    page.meta.en!.description = "short";
  });

  assert.equal(computeSiteHealth(content, noTracking, 0).pagesWithDescription, 1);
});

test("counts connected tracking tools and ignores empty IDs", () => {
  const content = cloneContent();

  assert.equal(computeSiteHealth(content, noTracking, 0).trackingConnected, 0);
  assert.equal(computeSiteHealth(content, { ga4Id: "", clarityId: "abcd1234ef" }, 0).trackingConnected, 1);

  const all = computeSiteHealth(
    content,
    {
      metaPixelId: "123456789012345",
      ga4Id: "G-ABC123XYZ9",
      tiktokPixelId: "ABCDEFGHIJ0123456789",
      snapPixelId: "12345678-1234-1234-1234-123456789abc",
      clarityId: "abcd1234ef",
    },
    0,
  );

  assert.equal(all.trackingConnected, 5);
  assert.equal(all.trackingTotal, 5);
});

test("passes the project count through", () => {
  assert.equal(computeSiteHealth(cloneContent(), noTracking, 3).projects, 3);
});
