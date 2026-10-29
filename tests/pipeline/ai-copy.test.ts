import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildSiteContent,
  generateSiteContent,
} from "../../src/features/site-creation/build-content";
import { setMinIntervalMs } from "../../src/features/site-creation/generation/rate-limit";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { getBlockDefinition, type Block } from "../../src/features/static-site-generator/blocks/catalog";
import { renderSite } from "../../src/features/static-site-generator/render-site";
import type { SiteContent } from "../../src/features/static-site-generator/site-content";
import { composeFor, richBrief, richProjects, thinBrief } from "./samples";
import { callsNamed, markedAnswer, stubModel, type StubAnswer } from "./stub-model";

setMinIntervalMs(0);

const thin = businessBriefSchema.parse(thinBrief);
const rich = businessBriefSchema.parse(richBrief);
const heroId = "index-hero-1";

type AnyProps = Record<string, unknown> & { title?: string; link?: { href: string } };

function isCopy(block: Block): boolean {
  return getBlockDefinition(block.type)?.kind === "copy";
}

function allBlocks(content: SiteContent): Block[] {
  return content.pages.flatMap((page) => page.blocks);
}

function propsOf(block: Block, locale: "en" | "ar" = "en"): AnyProps {
  return block.props[locale] as AnyProps;
}

function propsText(block: Block, locale: "en" | "ar" = "en"): string {
  return JSON.stringify(block.props[locale]);
}

// A fact block's data: everything except the headings the AI may write.
function factData(props: AnyProps) {
  const headings = ["eyebrow", "title", "body", "link"];
  const data = Object.entries(props).filter(([key]) => !headings.includes(key));
  return { data, linkHref: props.link?.href };
}

// Replaces every string with "" so two locales can be compared by structure only.
function structureOf(value: unknown): unknown {
  return JSON.parse(JSON.stringify(value), (_key, item) => (typeof item === "string" ? "" : item));
}

function withHeroTitle(answer: StubAnswer, title: string): StubAnswer {
  if (answer.blocks[heroId]) {
    answer.blocks[heroId].title = title;
  }

  return answer;
}

test("AI writes fact block headings but never fact data or the site facts (CODE_RULES §8)", async () => {
  const current = composeFor(richBrief, richProjects);
  const stub = stubModel(() => {
    const answer = markedAnswer(current, "AI");

    for (const props of Object.values(answer.blocks)) {
      Object.assign(props, {
        businessName: "Hijacked Ltd",
        email: "hijack@example.com",
        projects: [{ title: "Hijacked project" }],
      });
    }

    return answer;
  });

  const generated = await generateSiteContent(stub.model, rich, current);

  assert.deepEqual(generated.facts, current.facts);

  for (const block of allBlocks(current)) {
    const after = allBlocks(generated).find((candidate) => candidate.id === block.id);
    assert.ok(after, `${block.id} disappeared`);
    assert.doesNotMatch(propsText(after), /Hijack/, `${block.id} took a fact field from the AI`);

    if (isCopy(block)) {
      assert.match(propsText(after), new RegExp(`AI:${block.id}:`), `${block.id} copy not written`);
    } else {
      assert.deepEqual(factData(propsOf(after)), factData(propsOf(block)), `${block.id} fact data changed`);
      assert.match(propsOf(after).title ?? "", new RegExp(`^AI:${block.id}:`), `${block.id} heading not written`);
    }
  }

  const html = renderSite(generated).map((file) => file.html).join("\n");
  assert.doesNotMatch(html, /Hijack/);
});

test("an invalid block is retried once in a single follow-up call and the valid retry is used", async () => {
  const content = buildSiteContent(thin);
  let heroCalls = 0;
  const stub = stubModel((call) => {
    const answer = markedAnswer(content, "AI");
    heroCalls += call.prompt.includes(heroId) ? 1 : 0;
    return call.prompt.includes(heroId) && heroCalls === 1 ? withHeroTitle(answer, "") : answer;
  });

  const generated = await generateSiteContent(stub.model, thin, null);

  const copyCalls = callsNamed(stub, "page_copy");
  assert.equal(copyCalls.length, content.pages.length + 1);

  const retry = copyCalls.filter((call) => call.prompt.includes(heroId))[1];
  const otherHomeIds = content.pages[0].blocks.map((block) => block.id).filter((id) => id !== heroId);
  assert.ok(otherHomeIds.every((id) => !retry.prompt.includes(id)), "the retry asked for valid blocks again");

  const hero = generated.pages[0].blocks.find((block) => block.id === heroId);
  assert.ok(hero);
  assert.match(propsOf(hero).title ?? "", /^AI:index-hero-1:/);
});

test("a block that is still invalid after the retry fails the generate", async () => {
  const content = buildSiteContent(thin);
  const stub = stubModel(() => withHeroTitle(markedAnswer(content, "AI"), ""));

  await assert.rejects(generateSiteContent(stub.model, thin, null), /index-hero-1/);
  assert.equal(
    callsNamed(stub, "page_copy").filter((call) => call.prompt.includes(heroId)).length,
    2,
  );
});

test("regenerate keeps ids, variants, hidden flags, order and images and replaces the copy (block plan)", async () => {
  const current = structuredClone(buildSiteContent(thin));
  const home = current.pages[0].blocks;
  const image = { src: "https://images.example.com/customer.jpg", alt: "Customer photo" };

  [home[1], home[2]] = [home[2], home[1]];
  home[3].hidden = true;
  home[0].variant = "full-image";
  Object.assign(home[0].props.en ?? {}, { image });

  const stub = stubModel(() => markedAnswer(current, "AI"));
  const generated = await generateSiteContent(stub.model, thin, current);

  for (const [pageIndex, page] of current.pages.entries()) {
    const after = generated.pages[pageIndex].blocks;

    assert.deepEqual(
      after.map(({ id, type, variant, hidden }) => ({ id, type, variant, hidden })),
      page.blocks.map(({ id, type, variant, hidden }) => ({ id, type, variant, hidden })),
    );

    for (const block of after.filter(isCopy)) {
      assert.match(propsText(block), new RegExp(`AI:${block.id}:`), `${block.id} copy not replaced`);
    }
  }

  assert.deepEqual(propsOf(generated.pages[0].blocks[0]).image, image);
});

test("a two-language site: the translate call fills the second locale with the same block structure (i18n plan)", async () => {
  const current = composeFor(richBrief, richProjects, ["en", "ar"]);
  const stub = stubModel((call) =>
    markedAnswer(current, call.name === "page_translation" ? "AR" : "EN"),
  );

  const generated = await generateSiteContent(stub.model, rich, current);
  const translations = callsNamed(stub, "page_translation");

  assert.equal(translations.length, current.pages.length);
  assert.ok(translations.every((call) => call.prompt.includes("EN:")), "translation input is not the written copy");

  for (const block of allBlocks(generated)) {
    assert.match(propsOf(block, "ar").title ?? `AR:${block.id}:`, new RegExp(`^AR:${block.id}:`));
    assert.deepEqual(structureOf(block.props.ar), structureOf(block.props.en), block.id);

    if (isCopy(block)) {
      assert.match(propsText(block, "en"), new RegExp(`EN:${block.id}:`));
      assert.doesNotMatch(propsText(block, "ar"), /EN:/);
    }
  }
});

test("a stub-generated site renders every copy block's new text", async () => {
  const content = buildSiteContent(thin);
  const stub = stubModel(() => markedAnswer(content, "AI"));
  const generated = await generateSiteContent(stub.model, thin, null);
  const files = renderSite(generated);

  for (const page of generated.pages) {
    const html = files.find((file) => file.fileName === `${page.slug}.html`)?.html ?? "";

    for (const block of page.blocks.filter(isCopy)) {
      assert.ok(html.includes(`AI:${block.id}:`), `${page.slug}: ${block.id} text is not in the HTML`);
    }
  }
});
