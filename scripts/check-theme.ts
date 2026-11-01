import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { blockDefinitions } from "../src/features/static-site-generator/blocks/catalog";
import type { Facts } from "../src/features/static-site-generator/blocks/facts";
import { designs, getDesignsForCategory } from "../src/features/static-site-generator/designs/registry";
import type { BlockDesign } from "../src/features/static-site-generator/designs/types";
import type { Locale } from "../src/features/static-site-generator/locale";
import {
  createPageContext,
  renderBlock,
  renderSite,
  toThemeBlock,
  type RenderedFile,
} from "../src/features/static-site-generator/render-site";
import {
  siteContentSchema,
  type SiteContent,
} from "../src/features/static-site-generator/site-content";
import { getThemeAssetsDirectory } from "../src/features/static-site-generator/site-paths";
import {
  getTemplateDesign,
  listTemplates,
} from "../src/features/static-site-generator/site-templates/registry";
import type { SiteTemplate } from "../src/features/static-site-generator/site-templates/types";
import { getTheme } from "../src/features/static-site-generator/themes/registry";
import type { Theme } from "../src/features/static-site-generator/themes/types";

type AnyBlockDefinition = (typeof blockDefinitions)[number];
type FixtureName = "full" | "minimal";

const themeId = process.argv[2] ?? "agenvo";
const locales: Locale[] = ["en", "ar"];
const fixtureNames: FixtureName[] = ["full", "minimal"];
const forbiddenOutput = ["undefined", "[object Object]"];
const samplesDirectory = path.join(process.cwd(), ".generator-build", "theme-samples", themeId);

let passCount = 0;
let failureCount = 0;

function pass(): void {
  passCount += 1;
}

function fail(label: string, messages: string[]): void {
  failureCount += 1;
  console.log(`FAIL ${label}`);

  for (const message of messages) {
    console.log(`     ${message}`);
  }
}

const facts: Facts = {
  businessName: "Agenvo",
  industry: "Architecture, engineering and interiors",
  email: "hello@agenvo.com",
  phone: "+41 44 123 4567",
  address: "Bahnhofstrasse 42, 8001 Zürich, Switzerland",
  yearsInBusiness: 18,
  projectCount: 180,
  services: ["Architecture", "Engineering", "Interiors"],
  clients: ["Meridian Holdings", "Kant Immobilien", "Fondazione Lago"],
  awards: [],
  projects: [],
  team: [],
  testimonials: [],
};

function localize<Value>(value: Value, siteLocales: Locale[]): Record<string, Value> {
  return Object.fromEntries(siteLocales.map((locale) => [locale, value]));
}

function buildBlock(
  definition: AnyBlockDefinition,
  design: string,
  fixture: FixtureName,
  id: string,
  siteLocales: Locale[],
): unknown {
  return {
    id,
    type: definition.type,
    design,
    hidden: false,
    props: localize(definition.fixtures[fixture], siteLocales),
  };
}

function buildPage(slug: string, blocks: unknown[], siteLocales: Locale[]): unknown {
  return {
    id: slug,
    slug,
    meta: localize(
      { title: `Agenvo ${slug}`, description: "Architecture, engineering and interiors." },
      siteLocales,
    ),
    blocks,
  };
}

function buildContent(
  siteLocales: Locale[],
  defaultLocale: Locale,
  pages: unknown[],
  templateId = themeId,
): SiteContent {
  return siteContentSchema.parse({
    theme: templateId,
    locales: siteLocales,
    defaultLocale,
    facts,
    nav: localize(
      {
        items: [
          { label: "Home", href: "index.html" },
          { label: "Contact", href: "contact.html" },
        ],
        cta: { label: "Inquire", href: "contact.html" },
        menuLabel: "Menu",
        languageLabel: "Language",
      },
      siteLocales,
    ),
    footer: localize(
      {
        blurb: "Architecture, engineering and interiors for those who build legacies.",
        copyright: "© 2026 Agenvo. All rights reserved.",
        photoCreditLabel: "Photo credits",
      },
      siteLocales,
    ),
    pages,
  });
}

function findOutputProblems(html: string): string[] {
  return forbiddenOutput
    .filter((text) => html.includes(text))
    .map((text) => `output contains "${text}"`);
}

// Classic's document loads these two CDN scripts today; a template may not add any other outside script.
const legacyScripts = ["https://cdn.tailwindcss.com", "https://unpkg.com/lucide@latest"];

function findScriptProblems(html: string): string[] {
  const sources = [...html.matchAll(/<script[^>]*\ssrc="([^"]*)"/g)].map((match) => match[1]);

  return sources
    .filter((src) => !/^(\.\.\/)*assets\//.test(src) && !legacyScripts.includes(src))
    .map((src) => `script src outside the pack assets: ${src}`);
}

function findDirectionProblems(html: string, locale: Locale): string[] {
  const expected = `<html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}">`;
  return html.includes(expected) ? [] : [`missing ${expected}`];
}

function renderOneBlock(
  theme: Theme,
  definition: AnyBlockDefinition,
  design: BlockDesign,
  fixture: FixtureName,
  toneIndex: number,
  locale: Locale,
): { blockHtml: string; documentHtml: string; blockId: string } {
  const blockId = `index-${definition.type}-1`;
  const content = buildContent([locale], locale, [
    buildPage("index", [buildBlock(definition, design.id, fixture, blockId, [locale])], [locale]),
  ]);
  const page = content.pages[0];
  const block = toThemeBlock(page.blocks[0], locale);
  const context = createPageContext(content, page, locale, [block]);
  const blockHtml = renderBlock(block, { ...context, tone: theme.tones[toneIndex] });
  const documentHtml = theme.renderDocument(context, blockHtml, "");

  return { blockHtml, documentHtml, blockId };
}

function checkBlock(
  theme: Theme,
  definition: AnyBlockDefinition,
  design: BlockDesign,
  fixture: FixtureName,
  toneIndex: number,
  locale: Locale,
): void {
  const label = `${design.id} fixture:${fixture} tone:${theme.tones[toneIndex]} locale:${locale}`;

  try {
    const { blockHtml, documentHtml, blockId } = renderOneBlock(
      theme,
      definition,
      design,
      fixture,
      toneIndex,
      locale,
    );
    const root = `<section data-block="${blockId}" data-design="${design.id}"`;
    const problems = [
      ...(blockHtml.trim().startsWith(root) ? [] : [`root element is not ${root}`]),
      ...findOutputProblems(documentHtml),
      ...findScriptProblems(documentHtml),
      ...findDirectionProblems(documentHtml, locale),
    ];

    if (problems.length > 0) {
      fail(label, problems);
      return;
    }

    pass();
  } catch (error) {
    fail(label, [error instanceof Error ? error.message : String(error)]);
  }
}

function buildSampleContent(siteLocales: Locale[], defaultLocale: Locale): SiteContent {
  const homeBlocks = blockDefinitions.map((definition) =>
    buildBlock(
      definition,
      getDesignsForCategory(definition.type)[0].id,
      "full",
      `index-${definition.type}-1`,
      siteLocales,
    ),
  );
  const contactBlocks = blockDefinitions
    .filter((definition) => ["hero", "contact", "location"].includes(definition.type))
    .map((definition) => {
      const categoryDesigns = getDesignsForCategory(definition.type);
      return buildBlock(
        definition,
        categoryDesigns.at(-1)?.id ?? categoryDesigns[0].id,
        "minimal",
        `contact-${definition.type}-1`,
        siteLocales,
      );
    });

  return buildContent(siteLocales, defaultLocale, [
    buildPage("index", homeBlocks, siteLocales),
    buildPage("contact", contactBlocks, siteLocales),
  ]);
}

function checkFileNames(label: string, files: RenderedFile[], expected: string[]): void {
  const actual = files.map((file) => file.fileName).sort();
  const sortedExpected = [...expected].sort();

  if (actual.join(",") === sortedExpected.join(",")) {
    pass();
    return;
  }

  fail(`${label} files`, [`expected ${sortedExpected.join(", ")}`, `got ${actual.join(", ")}`]);
}

function getFileLocale(fileName: string, defaultLocale: Locale): Locale {
  return locales.find((locale) => fileName.startsWith(`${locale}/`)) ?? defaultLocale;
}

function findRedirectProblems(html: string, defaultLocale: Locale): string[] {
  const target = `url=${defaultLocale}/index.html`;
  return html.includes(target) ? [] : [`redirect does not contain ${target}`];
}

function checkSampleFiles(
  label: string,
  files: RenderedFile[],
  defaultLocale: Locale,
  multilingual: boolean,
): void {
  for (const file of files) {
    const fileLabel = `${label} ${file.fileName}`;
    const isRedirect = multilingual && file.fileName === "index.html";
    const locale = getFileLocale(file.fileName, defaultLocale);
    const problems = isRedirect
      ? findRedirectProblems(file.html, defaultLocale)
      : [
          ...findOutputProblems(file.html),
          ...findScriptProblems(file.html),
          ...findDirectionProblems(file.html, locale),
        ];

    if (problems.length > 0) {
      fail(fileLabel, problems);
    } else {
      pass();
    }
  }
}

function checkLanguageLink(label: string, files: RenderedFile[]): void {
  const enHome = files.find((file) => file.fileName === "en/index.html");
  const hasLink = enHome?.html.includes('href="../ar/index.html"') ?? false;

  if (hasLink) {
    pass();
  } else {
    fail(`${label} language link`, ['en/index.html has no link to "../ar/index.html"']);
  }
}

async function writeSample(theme: Theme, name: string, files: RenderedFile[]): Promise<void> {
  const directory = path.join(samplesDirectory, name);
  await rm(directory, { recursive: true, force: true });
  await mkdir(path.join(directory, "assets"), { recursive: true });

  for (const file of files) {
    const filePath = path.join(directory, file.fileName);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, file.html, "utf8");
  }

  for (const asset of theme.assets) {
    await copyFile(
      path.join(getThemeAssetsDirectory(theme.id), asset),
      path.join(directory, "assets", asset),
    );
  }
}

async function checkSamples(theme: Theme): Promise<void> {
  const samples: { name: string; locales: Locale[]; defaultLocale: Locale; expected: string[] }[] = [
    { name: "en", locales: ["en"], defaultLocale: "en", expected: ["index.html", "contact.html"] },
    { name: "ar", locales: ["ar"], defaultLocale: "ar", expected: ["index.html", "contact.html"] },
    {
      name: "en-ar",
      locales: ["en", "ar"],
      defaultLocale: "ar",
      expected: ["index.html", "en/index.html", "en/contact.html", "ar/index.html", "ar/contact.html"],
    },
  ];

  for (const sample of samples) {
    const label = `sample:${sample.name}`;

    try {
      const files = renderSite(buildSampleContent(sample.locales, sample.defaultLocale));
      checkFileNames(label, files, sample.expected);
      const multilingual = sample.locales.length > 1;
      checkSampleFiles(label, files, sample.defaultLocale, multilingual);

      if (multilingual) {
        checkLanguageLink(label, files);
      }

      await writeSample(theme, sample.name, files);
    } catch (error) {
      fail(label, [error instanceof Error ? error.message : String(error)]);
    }
  }
}

function checkBlocks(theme: Theme): number {
  let combinations = 0;

  for (const design of designs) {
    const definition = blockDefinitions.find((candidate) => candidate.type === design.category);

    if (!definition) {
      console.log(`SKIP ${design.id} (unknown category "${design.category}")`);
      continue;
    }

    for (const fixture of fixtureNames) {
      theme.tones.forEach((_tone, toneIndex) => {
        for (const locale of locales) {
          combinations += 1;
          checkBlock(theme, definition, design, fixture, toneIndex, locale);
        }
      });
    }
  }

  return combinations;
}

function checkTemplateBlock(
  template: SiteTemplate,
  definition: AnyBlockDefinition,
  fixture: FixtureName,
  locale: Locale,
): void {
  const designId = getTemplateDesign(template, definition.type);
  const label = `template:${template.id} ${designId} fixture:${fixture} locale:${locale}`;

  try {
    const blockId = `index-${definition.type}-1`;
    const block = buildBlock(definition, designId, fixture, blockId, [locale]);
    const content = buildContent([locale], locale, [buildPage("index", [block], [locale])], template.id);
    const files = renderSite(content);
    const problems = files.flatMap((file) => [
      ...findOutputProblems(file.html),
      ...findScriptProblems(file.html),
      ...findDirectionProblems(file.html, locale),
      ...(file.html.includes(`<section data-block="${blockId}" data-design="${designId}"`)
        ? []
        : [`${file.fileName}: root element missing for ${designId}`]),
    ]);

    if (problems.length > 0) {
      fail(label, problems);
      return;
    }

    pass();
  } catch (error) {
    fail(label, [error instanceof Error ? error.message : String(error)]);
  }
}

// Every registered template must render every block type, full and minimal, in both languages.
function checkTemplates(): number {
  let combinations = 0;

  for (const template of listTemplates()) {
    for (const definition of blockDefinitions) {
      for (const fixture of fixtureNames) {
        for (const locale of locales) {
          combinations += 1;
          checkTemplateBlock(template, definition, fixture, locale);
        }
      }
    }
  }

  return combinations;
}

async function main(): Promise<void> {
  const theme = getTheme(themeId);
  const combinations = checkBlocks(theme);
  const templateCombinations = checkTemplates();
  await checkSamples(theme);

  console.log(`Rendered ${templateCombinations} template combinations.`);
  console.log(`Rendered ${combinations} block combinations; ${passCount} checks passed.`);
  console.log(`Samples written to ${samplesDirectory}`);

  if (failureCount > 0) {
    console.log(`${failureCount} check(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log(`All ${theme.name} theme checks passed.`);
  }
}

void main();
