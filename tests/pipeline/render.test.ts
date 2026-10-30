import assert from "node:assert/strict";
import { test } from "node:test";
import { renderSite, type RenderedFile } from "../../src/features/static-site-generator/render-site";
import type { SiteContent } from "../../src/features/static-site-generator/site-content";
import { composeFor, richBrief, richProjects, thinBrief } from "./samples";

function fileNames(files: RenderedFile[]): string[] {
  return files.map((file) => file.fileName);
}

function findFile(files: RenderedFile[], fileName: string): RenderedFile {
  const file = files.find((candidate) => candidate.fileName === fileName);
  assert.ok(file, `${fileName} was not rendered`);
  return file;
}

function renderedBlockIds(html: string): string[] {
  return [...html.matchAll(/<section\b[^>]*\bdata-block="([^"]*)"/g)].map((match) => match[1]);
}

function visibleBlockIds(content: SiteContent, slug: string): string[] {
  const page = content.pages.find((candidate) => candidate.slug === slug);
  assert.ok(page, `page ${slug} missing`);
  return page.blocks.filter((block) => !block.hidden).map((block) => block.id);
}

function hideBlock(content: SiteContent, blockId: string): SiteContent {
  const copy = structuredClone(content);

  for (const page of copy.pages) {
    for (const block of page.blocks) {
      if (block.id === blockId) {
        block.hidden = true;
      }
    }
  }

  return copy;
}

test("render writes every page of a one-language site with no error", () => {
  const files = renderSite(composeFor(thinBrief));

  assert.deepEqual(fileNames(files), ["index.html", "services.html", "contact.html"]);

  for (const file of files) {
    assert.match(file.html, /^<!DOCTYPE html>[\s\S]*<\/html>\s*$/);
  }
});

test("a two-language site writes en/, ar/ and the root redirect to the default language", () => {
  const content = composeFor(richBrief, richProjects, ["ar", "en"]);
  const files = renderSite(content);
  const expected = ["index.html"].concat(
    ...["ar", "en"].map((locale) => content.pages.map((page) => `${locale}/${page.slug}.html`)),
    ["ar", "en"].map((locale) => `${locale}/projects/corporate-tower.html`),
  );

  assert.deepEqual(fileNames(files), expected);
  assert.match(findFile(files, "index.html").html, /http-equiv="refresh" content="0; url=ar\/index\.html"/);
});

test("ar pages have dir=\"rtl\", en pages do not", () => {
  const files = renderSite(composeFor(richBrief, richProjects, ["en", "ar"]));

  for (const file of files.filter((candidate) => candidate.fileName !== "index.html")) {
    const isArabic = file.fileName.startsWith("ar/");
    assert.equal(/<html[^>]*\sdir="rtl"/.test(file.html), isArabic, file.fileName);
  }

  const arabicOnly = renderSite(composeFor(thinBrief, [], ["ar"]));
  assert.match(findFile(arabicOnly, "index.html").html, /<html[^>]*\sdir="rtl"/);
});

test("every visible block is exactly one <section data-block=\"{id}\"> (CODE_RULES §8)", () => {
  const content = composeFor(richBrief, richProjects, ["en", "ar"]);
  const files = renderSite(content);

  for (const locale of content.locales) {
    for (const page of content.pages) {
      const html = findFile(files, `${locale}/${page.slug}.html`).html;
      const expected = visibleBlockIds(content, page.slug);

      assert.ok(expected.length > 0);
      assert.deepEqual(renderedBlockIds(html), expected, `${locale}/${page.slug}.html`);
      assert.equal(html.split("data-block=").length - 1, expected.length);
    }
  }
});

test("hidden blocks are not in the HTML", () => {
  const content = composeFor(richBrief, richProjects);
  const blockId = "index-clients-1";

  assert.ok(renderedBlockIds(findFile(renderSite(content), "index.html").html).includes(blockId));

  const html = findFile(renderSite(hideBlock(content, blockId)), "index.html").html;
  assert.ok(!renderedBlockIds(html).includes(blockId));
  assert.ok(!html.includes(`data-block="${blockId}"`));
});

test("a fact block without its facts never renders (CODE_RULES §8)", () => {
  const files = renderSite(composeFor({ ...richBrief, notableClients: "" }, richProjects));

  for (const file of files) {
    assert.doesNotMatch(file.html, /data-block="[a-z-]+-clients-\d+"/, file.fileName);
  }
});

test("<script> and quotes in the business name and texts are escaped (CODE_RULES §8)", () => {
  const brief = {
    ...thinBrief,
    businessName: 'Nour <script>alert("name")</script> Studio',
    industry: `Design & "build" <img src=x onerror=alert(1)>`,
    notableClients: "O'Brien \"Co\" <b>, Kant <i>Immobilien</i>, Lago </section>",
  };
  const projects = [
    {
      title: "Tower <script>alert(2)</script>",
      images: [{ src: "https://images.example.com/a.jpg", alt: 'x" onload="alert(3)' }],
    },
  ];
  const files = renderSite(composeFor(brief, projects));
  const allHtml = files.map((file) => file.html).join("\n");

  assert.ok(!allHtml.includes("<script>alert("), "raw <script> payload in output");
  assert.ok(!allHtml.includes("<img src=x"), "raw <img> payload in output");
  assert.ok(!allHtml.includes('" onload="'), "attribute broken out of its quotes");
  assert.ok(!allHtml.includes('"build"'), "raw double quotes from text in output");
  assert.ok(!allHtml.includes("<b>") && !allHtml.includes("<i>Immobilien"), "raw tags from facts");
  assert.ok(allHtml.includes("Nour &lt;script&gt;alert(&quot;name&quot;)&lt;/script&gt; Studio"));
  assert.ok(allHtml.includes("O&#39;Brien &quot;Co&quot; &lt;b&gt;"));
});
