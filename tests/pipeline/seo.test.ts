import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildSiteContent,
  generateSiteContent,
} from "../../src/features/site-creation/build-content";
import { setMinIntervalMs } from "../../src/features/site-creation/generation/rate-limit";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import type { SiteContent } from "../../src/features/static-site-generator/site-content";
import { composeFor, richBrief, richProjects, thinBrief } from "./samples";
import { callsNamed, markedAnswer, stubModel, stubProfile } from "./stub-model";

setMinIntervalMs(0);

const thin = businessBriefSchema.parse(thinBrief);
const rich = businessBriefSchema.parse(richBrief);

const englishDescription =
  "Calm, practical interior design for homes and workplaces, from the first sketch to the final handover, with a clear process and care for light and materials.";
const arabicDescription =
  "تصميم داخلي هادئ وعملي للمنازل وأماكن العمل، من أول رسم حتى التسليم النهائي، بعملية واضحة واهتمام بالضوء والمواد والاستخدام اليومي في كل مساحة.";

function isArabic(call: { prompt: string }): boolean {
  return call.prompt.includes("Modern Standard Arabic");
}

function seoAnswer(content: SiteContent, call: { prompt: string }) {
  const arabic = isArabic(call);

  return {
    pages: content.pages.map((page) => ({
      slug: page.slug,
      title: arabic ? `عنوان ${page.slug}` : `${page.slug} | design studio`,
      description: arabic ? arabicDescription : englishDescription,
    })),
  };
}

function pageOf(content: SiteContent, slug: string) {
  const page = content.pages.find((candidate) => candidate.slug === slug);
  assert.ok(page, `page ${slug} is missing`);
  return page;
}

test("SEO step writes a title and a description for every page in every locale", async () => {
  const content = composeFor(richBrief, richProjects, ["en", "ar"]);
  const stub = stubModel(
    () => markedAnswer(content, "AI"),
    () => stubProfile,
    (call) => seoAnswer(content, call),
  );

  const generated = await generateSiteContent(stub.model, rich, content);

  assert.equal(callsNamed(stub, "page_seo").length, 2);

  for (const page of content.pages) {
    for (const locale of content.locales) {
      const meta = pageOf(generated, page.slug).meta[locale];
      const expected = seoAnswer(content, { prompt: locale === "ar" ? "Modern Standard Arabic" : "" })
        .pages.find((item) => item.slug === page.slug);

      assert.ok(meta);
      assert.ok(expected);
      assert.equal(meta.title, expected.title, `${page.slug}/${locale} title`);
      assert.equal(meta.description, expected.description, `${page.slug}/${locale} description`);
      assert.ok(meta.title.length <= 60, `${page.slug}/${locale} title too long`);
      assert.ok(meta.description.length >= 50, `${page.slug}/${locale} description too short`);
      assert.ok(meta.description.length <= 160, `${page.slug}/${locale} description too long`);
    }
  }
});

test("over-long SEO output is trimmed on a word boundary", async () => {
  const content = composeFor(thinBrief);
  const longTitle =
    "A calm interior design studio for homes and workplaces with a clear process from first sketch to handover";
  const longDescription = "word ".repeat(40).trim();
  const stub = stubModel(
    () => markedAnswer(content, "AI"),
    () => stubProfile,
    () => ({
      pages: content.pages.map((page) => ({
        slug: page.slug,
        title: longTitle,
        description: longDescription,
      })),
    }),
  );

  const generated = await generateSiteContent(stub.model, thin, content);
  const meta = pageOf(generated, "index").meta.en;

  assert.ok(meta);
  assert.ok(meta.title.length <= 60);
  assert.ok(meta.description.length <= 160);
  assert.equal(longTitle[meta.title.length], " ", "title cut inside a word");
  assert.equal(longDescription[meta.description.length], " ", "description cut inside a word");
});

test("SEO failure falls back to the template meta and the site still renders", async (t) => {
  t.mock.method(console, "error", () => undefined);
  const content = composeFor(thinBrief);
  const stub = stubModel(
    () => markedAnswer(content, "AI"),
    () => stubProfile,
    () => {
      throw new Error("SEO is unavailable.");
    },
  );

  const generated = await generateSiteContent(stub.model, thin, content);
  const template = buildSiteContent(thin);

  for (const page of content.pages) {
    const meta = pageOf(generated, page.slug).meta.en;

    assert.ok(meta);
    assert.equal(meta.title, pageOf(template, page.slug).meta.en!.title);
    assert.equal(meta.description, stubProfile.summary);
  }

  const files = renderSite(generated);
  assert.equal(files.length, content.pages.length);
  assert.ok(files.every((file) => file.html.length > 0));
});

test("SEO output never becomes fact data", async () => {
  const content = composeFor(richBrief, richProjects, ["en", "ar"]);
  const stub = stubModel(
    () => markedAnswer(content, "AI"),
    () => stubProfile,
    (call) => ({
      ...seoAnswer(content, call),
      businessName: "Hijacked Ltd",
      phone: "+00 000 000",
      email: "hijack@example.com",
      address: "Hijacked Street 1",
      projects: [{ title: "Hijacked project" }],
    }),
  );

  const generated = await generateSiteContent(stub.model, rich, content);
  const html = renderSite(generated)
    .map((file) => file.html)
    .join("\n");

  assert.deepEqual(generated.facts, content.facts);
  assert.doesNotMatch(html, /Hijacked|hijack@example\.com/);
  assert.ok(html.includes("+41 44 123 4567"), "the real phone is missing");
  assert.ok(html.includes("hello@agenvo.com"), "the real email is missing");
});
