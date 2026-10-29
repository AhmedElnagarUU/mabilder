import assert from "node:assert/strict";
import { test } from "node:test";
import { getBlockDefinition } from "../../src/features/static-site-generator/blocks/catalog";
import type { Facts } from "../../src/features/static-site-generator/blocks/facts";
import type { SiteContent } from "../../src/features/static-site-generator/site-content";
import { toFactProjects } from "../../src/features/projects/facts";
import type { Project } from "../../src/features/projects/types";
import { refreshFactBlocks } from "../../src/features/site-creation/refresh-facts";
import { businessBriefSchema } from "../../src/features/site-creation/types";
import { composeFor, pageSlugs, richBrief, richProjects, thinBrief } from "./samples";

const brief = businessBriefSchema.parse(richBrief);
const thin = businessBriefSchema.parse(thinBrief);
const currentYear = 2026;

function makeFactProject(index: number, showOnHome = true): Facts["projects"][number] {
  return {
    title: `Project ${index}`,
    year: "2024",
    showOnHome,
    images: [{ src: `https://example.com/photo-${index}.jpg`, alt: `Photo ${index}` }],
  };
}

function makeProjects(count: number, showOnHome = true): Facts["projects"] {
  return Array.from({ length: count }, (_unused, index) => makeFactProject(index + 1, showOnHome));
}

function allBlocks(content: SiteContent) {
  return content.pages.flatMap((page) => page.blocks);
}

function copyBlocks(content: SiteContent) {
  return allBlocks(content).filter((block) => getBlockDefinition(block.type)?.kind === "copy");
}

function projectBlocks(content: SiteContent, pageId: string) {
  return (
    content.pages.find((page) => page.id === pageId)?.blocks.filter((block) => block.type === "projects") ?? []
  );
}

function itemTitles(content: SiteContent, pageId: string, locale: "en" | "ar" = "en"): string[] {
  const [block] = projectBlocks(content, pageId);
  const props = block?.props[locale] as { items: { title: string }[] } | undefined;
  return props?.items.map((item) => item.title) ?? [];
}

// A site the owner has already edited: copy text changed, a block hidden, blocks reordered.
function editedSite(projects: Facts["projects"]): SiteContent {
  const content = structuredClone(composeFor(richBrief, projects));
  const home = content.pages[0];

  const cta = home.blocks.find((block) => block.type === "cta");
  (cta?.props.en as { title: string }).title = "Edited call to action";

  const services = home.blocks.find((block) => block.type === "services");
  if (services) {
    services.hidden = true;
  }

  const [hero, ...rest] = home.blocks;
  home.blocks = [...rest.reverse(), hero];

  return content;
}

test("new projects change only the fact blocks", () => {
  const before = editedSite(richProjects);
  const after = refreshFactBlocks(before, brief, makeProjects(3), currentYear);

  assert.deepEqual(copyBlocks(after), copyBlocks(before));
  assert.deepEqual(
    allBlocks(after).map((block) => [block.id, block.hidden]),
    allBlocks(before).map((block) => [block.id, block.hidden]),
  );
  assert.deepEqual(itemTitles(after, "projects"), ["Project 1", "Project 2", "Project 3"]);
  assert.deepEqual(after.nav, before.nav);
  assert.deepEqual(after.footer, before.footer);
});

test("fact blocks other than projects are not changed", () => {
  const before = editedSite(richProjects);
  const after = refreshFactBlocks(before, brief, makeProjects(3), currentYear);
  const others = (content: SiteContent) =>
    allBlocks(content).filter(
      (block) => getBlockDefinition(block.type)?.kind === "fact" && block.type !== "projects",
    );

  assert.deepEqual(others(after), others(before));
});

test("with no home projects the home block is skipped but the Projects page stays", () => {
  const before = composeFor(richBrief, richProjects);
  const after = refreshFactBlocks(before, brief, makeProjects(3, false), currentYear);

  assert.equal(projectBlocks(after, "index").length, 0);
  assert.ok(pageSlugs(after).includes("projects"));
  assert.equal(itemTitles(after, "projects").length, 3);
  assert.deepEqual(copyBlocks(after), copyBlocks(before));
});

test("the home block shows at most 6 projects in order, the Projects page all of them", () => {
  const after = refreshFactBlocks(composeFor(richBrief, richProjects), brief, makeProjects(8), currentYear);

  assert.deepEqual(
    itemTitles(after, "index"),
    ["Project 1", "Project 2", "Project 3", "Project 4", "Project 5", "Project 6"],
  );
  assert.equal(itemTitles(after, "projects").length, 8);
});

test("only projects marked for the home page are on the home page", () => {
  const projects = [makeFactProject(1, false), makeFactProject(2), makeFactProject(3, false), makeFactProject(4)];
  const after = refreshFactBlocks(composeFor(richBrief, richProjects), brief, projects, currentYear);

  assert.deepEqual(itemTitles(after, "index"), ["Project 2", "Project 4"]);
  assert.equal(itemTitles(after, "projects").length, 4);
});

test("the first project adds the home block and the Projects page, copy stays the same", () => {
  const before = composeFor(thinBrief, []);
  assert.ok(!pageSlugs(before).includes("projects"));
  assert.equal(projectBlocks(before, "index").length, 0);

  const after = refreshFactBlocks(before, thin, makeProjects(1), currentYear);
  const homeTypes = after.pages[0].blocks.map((block) => block.type);

  assert.deepEqual(pageSlugs(after), ["index", "services", "projects", "contact"]);
  assert.equal(after.nav.en?.items.length, 4);
  assert.equal(homeTypes[homeTypes.indexOf("projects") - 1], "intro");
  assert.deepEqual(
    copyBlocks(after).filter((block) => before.pages[0].blocks.some((old) => old.id === block.id)),
    copyBlocks(before).filter((block) => after.pages[0].blocks.some((kept) => kept.id === block.id)),
  );
});

test("deleting the last project removes the Projects page and the projects blocks", () => {
  const after = refreshFactBlocks(composeFor(thinBrief, makeProjects(1)), thin, [], currentYear);

  assert.ok(!pageSlugs(after).includes("projects"));
  assert.equal(allBlocks(after).filter((block) => block.type === "projects").length, 0);
  assert.ok(!after.nav.en?.items.some((item) => item.href === "projects.html"));
  assert.deepEqual(after.facts.projects, []);
});

test("a hidden projects block stays hidden when its projects change", () => {
  const before = structuredClone(composeFor(richBrief, richProjects));
  projectBlocks(before, "index")[0].hidden = true;

  const after = refreshFactBlocks(before, brief, makeProjects(2), currentYear);

  assert.equal(projectBlocks(after, "index")[0].hidden, true);
  assert.deepEqual(itemTitles(after, "index"), ["Project 1", "Project 2"]);
});

function makeProject(order: number, overrides: Partial<Project> = {}): Project {
  return {
    id: `id-${order}`,
    order,
    title: { en: `Tower ${order}` },
    photos: [{ url: `https://example.com/${order}.jpg` }],
    showOnHome: true,
    ...overrides,
  };
}

test("projects become facts in their saved order, with the photo URL as the image", () => {
  const facts = toFactProjects([makeProject(2), makeProject(0), makeProject(1)], ["en"], "en");

  assert.deepEqual(facts.map((project) => project.title), ["Tower 0", "Tower 1", "Tower 2"]);
  assert.equal(facts[0].images[0].src, "https://example.com/0.jpg");
  assert.equal(facts[0].images[0].alt, "Tower 0");
});

test("a two-language site falls back to the first language when the second is empty", () => {
  const projects = [
    makeProject(0, { title: { en: "Tower", ar: "Ø§Ù„Ø¨Ø±Ø¬" }, category: { en: "Offices" } }),
    makeProject(1),
  ];
  const content = refreshFactBlocks(
    composeFor(richBrief, [], ["en", "ar"]),
    brief,
    toFactProjects(projects, ["en", "ar"], "en"),
    currentYear,
  );

  assert.deepEqual(itemTitles(content, "projects", "en"), ["Tower", "Tower 1"]);
  assert.deepEqual(itemTitles(content, "projects", "ar"), ["Ø§Ù„Ø¨Ø±Ø¬", "Tower 1"]);

  const [block] = projectBlocks(content, "projects");
  const arabic = block.props.ar as { items: { category?: string }[] };
  assert.equal(arabic.items[0].category, "Offices");
});

test("a project with a title only in the second language still gets a title", () => {
  const facts = toFactProjects([makeProject(0, { title: { ar: "Ø§Ù„Ø¨Ø±Ø¬" } })], ["en", "ar"], "en");

  assert.equal(facts[0].title, "Ø§Ù„Ø¨Ø±Ø¬");
});

