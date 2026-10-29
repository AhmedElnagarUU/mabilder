import assert from "node:assert/strict";
import { test } from "node:test";
import { getBlockDefinition } from "../../src/features/static-site-generator/blocks/catalog";
import {
  siteContentSchema,
  type SiteContent,
} from "../../src/features/static-site-generator/site-content";
import {
  blockIds,
  composeFor,
  factsFor,
  pageSlugs,
  richBrief,
  richProjects,
  thinBrief,
} from "./samples";

function blocksOfType(content: SiteContent, type: string) {
  return content.pages.flatMap((page) => page.blocks.filter((block) => block.type === type));
}

function factBlockTypes(content: SiteContent): string[] {
  return content.pages.flatMap((page) =>
    page.blocks
      .filter((block) => getBlockDefinition(block.type)?.kind === "fact")
      .map((block) => block.type),
  );
}

test("thin brief composes Home + Services + Contact only", () => {
  assert.deepEqual(pageSlugs(composeFor(thinBrief)), ["index", "services", "contact"]);
});

test("rich brief composes all 5 pages", () => {
  assert.deepEqual(pageSlugs(composeFor(richBrief, richProjects)), [
    "index",
    "about",
    "services",
    "projects",
    "contact",
  ]);
});

test("same input gives the same block ids (CODE_RULES §8: composition is deterministic)", () => {
  const first = composeFor(richBrief, richProjects, ["en", "ar"]);
  const second = composeFor(richBrief, richProjects, ["en", "ar"]);

  assert.deepEqual(blockIds(second), blockIds(first));
  assert.deepEqual(second, first);
});

test("every composed site passes siteContentSchema", () => {
  const sites = [
    composeFor(thinBrief),
    composeFor(thinBrief, [], ["ar"]),
    composeFor(richBrief, richProjects),
    composeFor(richBrief, richProjects, ["en", "ar"]),
  ];

  for (const content of sites) {
    const result = siteContentSchema.safeParse(content);
    assert.ok(result.success, result.success ? "" : result.error.message);
  }
});

test("a fact block without its facts is never composed (CODE_RULES §8: needs(facts) decides)", () => {
  assert.deepEqual(factBlockTypes(composeFor(thinBrief)), []);

  const withClients = composeFor(richBrief, richProjects);
  const withoutClients = composeFor({ ...richBrief, notableClients: "" }, richProjects);

  assert.ok(blocksOfType(withClients, "clients").length > 0, "rich brief should show clients");
  assert.deepEqual(blocksOfType(withoutClients, "clients"), []);
});

test("fact blocks carry the brief's facts, not copy (CODE_RULES §8: facts are never written by AI)", () => {
  const facts = factsFor(richBrief, richProjects);
  const content = composeFor(richBrief, richProjects, ["en", "ar"]);

  assert.deepEqual(content.facts, facts);
  assert.ok(blocksOfType(content, "clients").length > 0, "rich brief should show clients");
  assert.ok(blocksOfType(content, "awards").length > 0, "rich brief should show awards");

  for (const block of blocksOfType(content, "clients")) {
    for (const locale of content.locales) {
      assert.deepEqual((block.props[locale] as { names: string[] }).names, facts.clients);
    }
  }

  for (const block of blocksOfType(content, "awards")) {
    for (const locale of content.locales) {
      assert.deepEqual((block.props[locale] as { items: unknown }).items, facts.awards);
    }
  }
});
