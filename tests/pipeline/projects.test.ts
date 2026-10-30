import assert from "node:assert/strict";
import { test } from "node:test";
import { getBlockDefinition } from "../../src/features/static-site-generator/blocks/catalog";
import type { Facts } from "../../src/features/static-site-generator/blocks/facts";
import type { SiteContent } from "../../src/features/static-site-generator/site-content";
import { toFactProjects } from "../../src/features/projects/facts";
import type { Project } from "../../src/features/projects/types";
import { renderSite } from "../../src/features/static-site-generator/render-site";
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


function fullProject(order: number, overrides: Partial<Project> = {}): Project {
  return makeProject(order, {
    title: { en: "Nile View", ar: "إطلالة النيل" },
    categoryKey: "residential",
    status: "completed",
    location: { en: "New Cairo", ar: "القاهرة الجديدة" },
    year: "2025",
    client: { en: "Private client", ar: "عميل خاص" },
    area: 220,
    duration: { en: "6 months", ar: "6 أشهر" },
    scope: ["Design", "Fit-out"],
    description: { en: "A bright family home.", ar: "منزل عائلي مشرق." },
    challenge: { en: "Tight deadline.", ar: "موعد ضيق." },
    solution: { en: "Phased delivery.", ar: "تسليم على مراحل." },
    result: { en: "Delivered early.", ar: "سُلّم مبكرًا." },
    photos: [
      { url: "https://example.com/cover.jpg", alt: "Living room" },
      { url: "https://example.com/second.jpg" },
    ],
    beforePhotos: [{ url: "https://example.com/before.jpg" }],
    ...overrides,
  });
}

function renderProjects(projects: Project[], locales: ("en" | "ar")[]) {
  const content = refreshFactBlocks(
    composeFor(richBrief, [], locales),
    brief,
    toFactProjects(projects, locales, "en"),
    currentYear,
  );
  return renderSite(content);
}

function htmlOf(files: { fileName: string; html: string }[], fileName: string): string {
  const file = files.find((candidate) => candidate.fileName === fileName);
  assert.ok(file, `${fileName} was not written`);
  return file.html;
}

test("an old project (title and photos only) still renders a card and a page", () => {
  const files = renderProjects([makeProject(0)], ["en"]);
  const card = htmlOf(files, "projects.html");
  const page = htmlOf(files, "projects/tower-0.html");

  assert.ok(card.includes("Tower 0"));
  assert.ok(card.includes('href="projects/tower-0.html"'));
  assert.ok(page.includes("Tower 0"));
  assert.ok(!page.includes("project-facts"));
  assert.ok(!page.includes('data-project-part="story"'));
  assert.ok(!page.includes('data-project-part="before"'));
});

test("a full project renders every filled fact and the story, with no empty labels", () => {
  const page = htmlOf(renderProjects([fullProject(0)], ["en"]), "projects/nile-view.html");

  for (const text of [
    "Residential", "Completed", "New Cairo", "2025", "220 m²", "6 months", "Private client",
    "Design, Fit-out", "A bright family home.", "Tight deadline.", "Phased delivery.",
    "Delivered early.", "Before", "After", "before.jpg", "second.jpg",
  ]) {
    assert.ok(page.includes(text), `missing ${text}`);
  }

  assert.ok(page.includes("frame-3x2"));
  assert.ok(page.includes("contact.html"));
  assert.ok(!/<dd[^>]*>\s*<\/dd>/.test(page));
  assert.ok(!/<h2[^>]*>\s*<\/h2>/.test(page));

  const sparse = htmlOf(renderProjects([fullProject(0, { client: undefined, area: undefined })], ["en"]), "projects/nile-view.html");
  assert.ok(!sparse.includes("Client"));
  assert.ok(!sparse.includes("Area"));
});

test("project pages exist for every project in both languages with unique slugs", () => {
  const projects = [fullProject(0), fullProject(1), makeProject(2, { title: { ar: "برج" } })];
  const files = renderProjects(projects, ["en", "ar"]);
  const names = files.map((file) => file.fileName).filter((name) => name.includes("/projects/"));

  assert.deepEqual(names.sort(), [
    "ar/projects/nile-view-2.html",
    "ar/projects/nile-view.html",
    "ar/projects/project-3.html",
    "en/projects/nile-view-2.html",
    "en/projects/nile-view.html",
    "en/projects/project-3.html",
  ]);
  assert.ok(htmlOf(files, "ar/projects/nile-view.html").includes("القاهرة الجديدة"));
  assert.ok(htmlOf(files, "ar/projects/nile-view.html").includes("مكتمل"));
  assert.ok(htmlOf(files, "en/projects/nile-view.html").includes("../../ar/projects/nile-view.html"));
});

test("project cards use the fixed 4:3 frame", () => {
  const files = renderProjects([fullProject(0), makeProject(1)], ["en"]);

  assert.equal(htmlOf(files, "projects.html").split("frame-4x3").length - 1, 2);
  assert.ok(htmlOf(files, "index.html").includes("frame-4x3"));
});

test("project facts are rebuilt from the owner's projects, never from edited block props", () => {
  const before = structuredClone(composeFor(richBrief, [], ["en"]));
  const withProjects = refreshFactBlocks(before, brief, toFactProjects([fullProject(0)], ["en"], "en"), currentYear);
  const tampered = structuredClone(withProjects);
  const [block] = projectBlocks(tampered, "projects");
  (block.props.en as { items: { title: string }[] }).items[0].title = "AI invented title";

  const after = refreshFactBlocks(tampered, brief, toFactProjects([fullProject(0)], ["en"], "en"), currentYear);

  assert.deepEqual(itemTitles(after, "projects"), ["Nile View"]);
});