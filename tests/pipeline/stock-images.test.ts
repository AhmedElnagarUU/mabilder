import assert from "node:assert/strict";
import { test } from "node:test";
import { generateSiteContent } from "../../src/features/site-creation/build-content";
import { setMinIntervalMs } from "../../src/features/site-creation/generation/rate-limit";
import { listImageSlots } from "../../src/features/site-creation/images/slots";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { getBlockDefinition, type Block } from "../../src/features/static-site-generator/blocks/catalog";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import type { SiteContent } from "../../src/features/static-site-generator/site-content";
import { composeFor, richBrief, richProjects, thinBrief } from "./samples";
import { markedAnswer, stubModel } from "./stub-model";

setMinIntervalMs(0);

// Pexels is a dependency of the code under test: tests pass a stub fetch (no network).

const thin = businessBriefSchema.parse(thinBrief);
const rich = businessBriefSchema.parse(richBrief);
const customerImage = { src: "https://example.com/customer.jpg", alt: "Our studio" };

type Stub = { fetch: typeof fetch; urls: string[] };
type ImageProps = { image?: { src: string; alt: string; credit?: { name: string; url: string } }; images?: ImageProps["image"][] };

function stubPhotos(count: number) {
  return Array.from({ length: count }, (_value, index) => {
    const id = index + 1;
    return {
      id,
      url: `https://www.pexels.com/photo/${id}/`,
      photographer: `Photographer ${id}`,
      alt: `Alt ${id}`,
      src: {
        large2x: `https://images.pexels.com/${id}-2x.jpg`,
        large: `https://images.pexels.com/${id}-l.jpg`,
        medium: `https://images.pexels.com/${id}-m.jpg`,
      },
    };
  });
}

function stubFetch(status = 200): Stub {
  const urls: string[] = [];
  const stub = async (input: string | URL | Request) => {
    urls.push(String(input));
    return Response.json(status === 200 ? { photos: stubPhotos(15) } : {}, { status });
  };

  return { fetch: stub as typeof fetch, urls };
}

function withKey(key: string | undefined) {
  if (key === undefined) {
    delete process.env.PEXELS_API_KEY;
  } else {
    process.env.PEXELS_API_KEY = key;
  }
}

function allBlocks(content: SiteContent): Block[] {
  return content.pages.flatMap((page) => page.blocks);
}

function copyBlocks(content: SiteContent): Block[] {
  return allBlocks(content).filter((block) => getBlockDefinition(block.type)?.kind === "copy");
}

function imagesOf(block: Block): NonNullable<ImageProps["image"]>[] {
  const props = block.props.en as ImageProps;
  return [props.image, ...(props.images ?? [])].filter((image) => image !== undefined);
}

function generate(content: SiteContent, brief: typeof thin, fetchFunction: typeof fetch) {
  const stub = stubModel(() => markedAnswer(content, "AI"));
  return generateSiteContent(stub.model, brief, content, fetchFunction);
}

function slotTypes(): string[] {
  return listImageSlots().map((slot) => slot.type);
}

test("slots are derived from the catalog: copy blocks only", () => {
  assert.deepEqual(slotTypes().sort(), ["feature-split", "hero", "intro"]);
});

test("empty copy-block image slots get stock photos with credits and the image variant", async () => {
  withKey("test-key");
  const current = composeFor(thinBrief);
  const stub = stubFetch();
  const generated = await generate(current, thin, stub.fetch);
  const hero = copyBlocks(generated).find((block) => block.type === "hero");

  assert.ok(hero);
  assert.notEqual(hero.variant, "text-only");
  assert.match(imagesOf(hero)[0].src, /^https:\/\/images\.pexels\.com\//);
  assert.match(imagesOf(hero)[0].credit?.name ?? "", /^Photographer /);
  assert.match(imagesOf(hero)[0].credit?.url ?? "", /^https:\/\/www\.pexels\.com\/photo\//);

  for (const block of copyBlocks(generated).filter((item) => slotTypes().includes(item.type))) {
    assert.ok(imagesOf(block).length > 0, `${block.id} has no image`);
  }

  const searches = new Set(stub.urls);
  assert.equal(searches.size, stub.urls.length, "the same search ran twice");
  assert.ok(stub.urls.length <= slotTypes().length);
  assert.match(decodeURIComponent(stub.urls[0]), /Interior\+design|Interior design/);
});

test("no photo id is used twice in one site", async () => {
  withKey("test-key");
  const generated = await generate(composeFor(richBrief, richProjects), rich, stubFetch().fetch);
  const sources = copyBlocks(generated).flatMap((block) => imagesOf(block).map((image) => image.credit?.url));

  assert.ok(sources.length > 1);
  assert.equal(new Set(sources).size, sources.length);
});

test("customer images and fact images are never replaced", async () => {
  withKey("test-key");
  const current = composeFor(richBrief, richProjects);
  const hero = copyBlocks(current).find((block) => block.type === "hero");
  assert.ok(hero);
  (hero.props.en as ImageProps).image = customerImage;

  const generated = await generate(current, rich, stubFetch().fetch);
  const heroAfter = allBlocks(generated).find((block) => block.id === hero.id);

  assert.deepEqual(imagesOf(heroAfter as Block), [customerImage]);
  assert.deepEqual(generated.facts, current.facts);

  for (const block of allBlocks(current).filter((item) => getBlockDefinition(item.type)?.kind === "fact")) {
    const after = allBlocks(generated).find((item) => item.id === block.id);
    const items = (props: unknown) => JSON.stringify((props as { items?: unknown }).items);
    assert.equal(items(after?.props.en), items(block.props.en), `${block.id} fact data changed`);
  }
});

test("Pexels failing or no key: generation succeeds, hero stays text-only, one log line", async (t) => {
  const log = t.mock.method(console, "error", () => undefined);
  withKey("test-key");
  const failing = await generate(composeFor(thinBrief), thin, stubFetch(500).fetch);
  assert.equal(log.mock.callCount(), 1);

  withKey(undefined);
  const stub = stubFetch();
  const keyless = await generate(composeFor(thinBrief), thin, stub.fetch);

  for (const generated of [failing, keyless]) {
    const hero = copyBlocks(generated).find((block) => block.type === "hero");
    assert.equal(hero?.variant, "text-only");
    assert.equal(imagesOf(hero as Block).length, 0);
  }

  assert.equal(stub.urls.length, 0);
});

test("credits are rendered in the footer", async () => {
  withKey("test-key");
  const generated = await generate(composeFor(thinBrief), thin, stubFetch().fetch);
  const names = copyBlocks(generated).flatMap((block) => imagesOf(block).map((image) => image.credit?.name ?? ""));
  const html = renderSite(generated).map((file) => file.html).join("\n");

  assert.ok(names.length > 0);

  for (const name of names) {
    assert.ok(html.includes(name), `${name} missing from the footer`);
  }
});

test("regenerate keeps the chosen images and makes no Pexels call; re-render never fetches", async (t) => {
  withKey("test-key");
  const first = await generate(composeFor(thinBrief), thin, stubFetch().fetch);
  const again = stubFetch();
  const regenerated = await generate(first, thin, again.fetch);

  assert.equal(again.urls.length, 0);

  for (const block of copyBlocks(first)) {
    const after = allBlocks(regenerated).find((item) => item.id === block.id);
    assert.deepEqual(imagesOf(after as Block), imagesOf(block));
    assert.equal(after?.variant, block.variant);
  }

  const globalFetch = t.mock.method(globalThis, "fetch", () => {
    throw new Error("render must not fetch");
  });
  renderSite(regenerated);
  assert.equal(globalFetch.mock.callCount(), 0);
});
