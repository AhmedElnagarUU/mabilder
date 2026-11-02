import assert from "node:assert/strict";
import { test } from "node:test";
import photosJson from "../../src/features/templates-gallery/demo/photos.json";
import {
  demoContent,
  demoContentFor,
  heroTitleOf,
} from "../../src/features/templates-gallery/demo/demo-content";
import { photoSlots } from "../../src/features/templates-gallery/demo/photo-slots";
import { getTemplate } from "../../src/features/static-site-generator/site-templates/registry";
import { getTheme } from "../../src/features/static-site-generator/themes/registry";
import {
  findPreviewAsset,
  findPreviewPage,
  listPreviewParams,
  previewLocales,
  previewTemplateIds,
} from "../../src/features/templates-gallery/preview";

const photoSets = photosJson.sets as Record<string, Record<string, { src: string } | undefined>>;

type DemoImage = { src: string; alt: string };

// Demo images are plain data inside the parsed content; walking it collects every image at any depth.
function collectImages(value: unknown, found: DemoImage[] = []): DemoImage[] {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectImages(item, found);
    }
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;

    if (typeof record.src === "string" && typeof record.alt === "string") {
      found.push({ src: record.src, alt: record.alt });
    }

    for (const item of Object.values(record)) {
      collectImages(item, found);
    }
  }

  return found;
}

function slotKeyForAlt(alt: string): string | null {
  for (const slot of photoSlots) {
    if (slot.alt.en === alt || slot.alt.ar === alt) {
      return slot.key;
    }
  }

  return null;
}

test("the demo content parses as site content with both locales and every main section", () => {
  assert.deepEqual([...demoContent.locales].sort(), ["ar", "en"]);
  assert.equal(demoContent.pages[0].slug, "index");

  const types = new Set<string>(demoContent.pages.flatMap((page) => page.blocks.map((block) => block.type)));

  for (const type of [
    "hero",
    "intro",
    "services",
    "projects",
    "stats",
    "process",
    "testimonials",
    "cta",
    "contact",
    "faq",
  ]) {
    assert.ok(types.has(type), `missing block type "${type}"`);
  }
});

test("the Arabic hero title is Arabic text", () => {
  assert.match(heroTitleOf("ar"), /[\u0600-\u06FF]/);
  assert.doesNotMatch(heroTitleOf("en"), /[\u0600-\u06FF]/);
});

test("no photo repeats across the per-template sets", () => {
  const ownerById = new Map<string, string>();

  for (const [templateId, set] of Object.entries(photoSets)) {
    for (const [slotKey, photo] of Object.entries(set)) {
      if (!photo) {
        continue;
      }

      const match = /\/photos\/(\d+)\//.exec(photo.src);
      const photoId = match?.[1];

      assert.ok(photoId, `${templateId}/${slotKey} has no Pexels photo id: ${photo.src}`);

      const owner = ownerById.get(photoId);

      assert.ok(!owner, `photo ${photoId} is in both ${owner} and ${templateId}/${slotKey}`);
      ownerById.set(photoId, `${templateId}/${slotKey}`);
    }
  }
});

test("each registered template's demo uses its own photo set", () => {
  assert.ok(photoSets.agenvo && photoSets.agenvo.hero, "photos.json has no agenvo set");

  for (const id of previewTemplateIds()) {
    const set = photoSets[id];

    assert.ok(set, `photos.json has no set for registered template "${id}"`);

    const images = collectImages(demoContentFor(id));

    assert.ok(images.length > 0, `${id} has no demo images`);

    for (const image of images) {
      const slotKey = slotKeyForAlt(image.alt);
      const slot = set[slotKey ?? ""];

      assert.ok(
        slotKey && slot,
        `${id} image alt "${image.alt}" does not match a photo slot`,
      );
      assert.equal(image.src, slot.src, `${id} image for slot "${slotKey}" is not from its own set`);
    }

    // The rendered preview page shows the template's own set, not the fallback agenvo photos.
    // Check the URL path without the query: `&` renders escaped (`&amp;`) in HTML attributes.
    if (id !== "agenvo") {
      const page = findPreviewPage(id, "en", []);
      const ownHero = photoSets[id].hero?.src.split("?")[0];
      const agenvoHero = photoSets.agenvo.hero?.src.split("?")[0];

      assert.ok(page);
      assert.ok(ownHero && agenvoHero, `photos.json has no hero for "${id}"`);
      assert.ok(
        page.html.includes(ownHero),
        `${id} preview does not show its own hero photo`,
      );
      assert.ok(
        !page.html.includes(agenvoHero),
        `${id} preview leaks the agenvo hero photo`,
      );
    }
  }
});

test("an unknown template id falls back to the agenvo set", () => {
  assert.deepEqual(demoContentFor("nowhere"), demoContent);
  assert.deepEqual(demoContentFor("nowhere"), demoContentFor("agenvo"));
});

test("every template renders the demo in en and ar without broken output", () => {
  assert.deepEqual(previewLocales(), ["en", "ar"]);

  for (const id of previewTemplateIds()) {
    for (const locale of previewLocales()) {
      for (const file of [[], [`${locale}`, "about.html"], [`${locale}`, "index.html"]]) {
        const page = findPreviewPage(id, locale, file);
        assert.ok(page, `${id} ${locale} ${file.join("/")}`);

        for (const leak of ["undefined", "[object Object]", "data-endpoint"]) {
          assert.ok(!page.html.includes(leak), `${id} ${locale} leaks "${leak}"`);
        }
      }
    }
  }
});

test("preview pages resolve internal links through the base href", () => {
  const page = findPreviewPage("agenvo", "en", ["en", "about.html"]);

  assert.ok(page);
  assert.ok(page.html.includes('<base href="/en/templates/agenvo/preview/en/">'));
});

test("the root redirect file and unknown files are not served", () => {
  // renderSite also outputs the redirect file "index.html" at the root; it must stay 404.
  assert.equal(findPreviewPage("agenvo", "en", ["index.html"]), null);
  assert.equal(findPreviewPage("agenvo", "en", ["en", "missing.html"]), null);
  assert.equal(findPreviewPage("agenvo", "en", ["ar", "about.html"]), null);
  assert.equal(findPreviewPage("nope", "en", []), null);
  // A foreign string does not pass the Locale validation of the preview route.
  assert.equal(findPreviewPage("agenvo", "no" as never, []), null);
});

test("theme assets are served through the same catch-all", async () => {
  const theme = getTheme(getTemplate("agenvo").shell);
  const asset = theme.assets.find((candidate) => candidate.endsWith(".css"));

  assert.ok(asset);
  const found = await findPreviewAsset("agenvo", "en", ["assets", asset]);

  assert.ok(found);
  assert.equal(found.contentType, "text/css; charset=utf-8");
  assert.equal(await findPreviewAsset("agenvo", "en", ["assets", "missing.css"]), null);
  assert.equal(await findPreviewAsset("agenvo", "en", ["en", "about.html"]), null);
});

test("preview params only produce valid route files", () => {
  const params = listPreviewParams();

  for (const param of params) {
    assert.ok(previewTemplateIds().includes(param.id));
    assert.ok(previewLocales().includes(param.locale));

    if (param.file.length > 0) {
      assert.ok(
        param.file[0] === param.locale || param.file[0] === "assets",
        `bad file prefix: ${param.file.join("/")}`,
      );
    }
  }
});
