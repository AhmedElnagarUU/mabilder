import type { Block } from "./blocks/catalog";
import { imageSchema } from "./blocks/common";
import { escapeAttribute } from "./content/html";
import {
  buildProjectPages,
  type ProjectDetail,
  type ProjectPage,
} from "./content/project-pages";
import { getDesign } from "./designs/registry";
import type { Locale } from "./locale";
import type { Page, SiteContent } from "./site-content";
import type { SiteRuntime } from "./site-runtime";
import { getTheme } from "./themes/registry";
import type {
  AlternatePage,
  BlockContext,
  PageContext,
  PhotoCredit,
  Theme,
  ThemeBlock,
  Tone,
} from "./themes/types";

export type RenderedFile = {
  fileName: string;
  html: string;
};

function pickLocale<Value>(value: { en?: Value; ar?: Value }, locale: Locale, label: string): Value {
  const picked = value[locale];

  if (picked === undefined) {
    throw new Error(`${label} has no content for locale "${locale}".`);
  }

  return picked;
}

export function toThemeBlock(block: Block, locale: Locale): ThemeBlock {
  const props = block.props[locale];

  if (props === undefined) {
    throw new Error(`Block "${block.id}" has no content for locale "${locale}".`);
  }

  return { id: block.id, type: block.type, design: block.design, props } as ThemeBlock;
}

function getVisibleBlocks(page: Page, locale: Locale): ThemeBlock[] {
  return page.blocks
    .filter((block) => !block.hidden && getDesign(block.design) !== undefined)
    .map((block) => toThemeBlock(block, locale));
}

function collectCredits(value: unknown, credits: Map<string, PhotoCredit>): void {
  if (Array.isArray(value)) {
    value.forEach((item) => collectCredits(item, credits));
    return;
  }

  if (typeof value !== "object" || value === null) {
    return;
  }

  const image = imageSchema.safeParse(value);

  if (image.success && image.data.credit) {
    credits.set(`${image.data.credit.name}|${image.data.credit.url}`, image.data.credit);
  }

  Object.values(value).forEach((item) => collectCredits(item, credits));
}

function getCredits(blocks: ThemeBlock[]): PhotoCredit[] {
  const credits = new Map<string, PhotoCredit>();
  blocks.forEach((block) => collectCredits(block.props, credits));
  return [...credits.values()];
}

function getAlternate(content: SiteContent, page: Page, locale: Locale): AlternatePage | undefined {
  const other = content.locales.find((candidate) => candidate !== locale);

  if (other === undefined) {
    return undefined;
  }

  return { locale: other, href: `../${other}/${page.slug}.html` };
}

function isMultilingual(content: SiteContent): boolean {
  return content.locales.length > 1;
}

function getPageFileName(content: SiteContent, page: Page, locale: Locale): string {
  return isMultilingual(content) ? `${locale}/${page.slug}.html` : `${page.slug}.html`;
}

export function createPageContext(
  content: SiteContent,
  page: Page,
  locale: Locale,
  blocks: ThemeBlock[],
  runtime: SiteRuntime = {},
): PageContext {
  return {
    content,
    page,
    locale,
    meta: pickLocale(page.meta, locale, `Page "${page.id}" meta`),
    nav: pickLocale(content.nav, locale, "Nav"),
    footer: pickLocale(content.footer, locale, "Footer"),
    rootPath: isMultilingual(content) ? "../" : "",
    linkPrefix: "",
    alternate: getAlternate(content, page, locale),
    credits: getCredits(blocks),
    runtime,
  };
}

export function renderBlock(block: ThemeBlock, context: BlockContext): string {
  const design = getDesign(block.design);

  if (!design) {
    throw new Error(`Unknown design "${block.design}".`);
  }

  return design.render(block, context);
}

function getTone(theme: Theme, index: number): Tone {
  return theme.tones[index % theme.tones.length];
}

function renderPage(
  theme: Theme,
  content: SiteContent,
  page: Page,
  locale: Locale,
  headExtra: string,
  runtime: SiteRuntime,
): RenderedFile {
  const blocks = getVisibleBlocks(page, locale);
  const context = createPageContext(content, page, locale, blocks, runtime);
  const body = [
    theme.renderNav(context),
    ...blocks.map((block, index) =>
      renderBlock(block, { ...context, tone: getTone(theme, index) }),
    ),
    theme.renderFooter(context),
  ].join("\n");

  return {
    fileName: getPageFileName(content, page, locale),
    html: theme.renderDocument(context, body, headExtra),
  };
}

function getProjectFileName(content: SiteContent, slug: string, locale: Locale): string {
  return isMultilingual(content) ? `${locale}/projects/${slug}.html` : `projects/${slug}.html`;
}

// A project page sits one folder below the site pages, so every relative path gets one more "../".
function createProjectContext(
  content: SiteContent,
  project: ProjectPage,
  detail: ProjectDetail,
  locale: Locale,
  runtime: SiteRuntime,
): PageContext {
  const page = content.pages.find((candidate) => candidate.slug === "projects") ?? content.pages[0];
  const base = createPageContext(content, page, locale, [], runtime);
  const other = content.locales.find((candidate) => candidate !== locale);
  const credits = new Map<string, PhotoCredit>();
  collectCredits(detail, credits);

  return {
    ...base,
    meta: {
      title: `${detail.title} | ${content.facts.businessName}`,
      description: detail.summary ?? content.facts.industry,
    },
    rootPath: isMultilingual(content) ? "../../" : "../",
    linkPrefix: "../",
    alternate:
      other && project.details[other]
        ? { locale: other, href: `../../${other}/projects/${project.slug}.html` }
        : undefined,
    credits: [...credits.values()],
  };
}

function renderProjectPages(
  theme: Theme,
  content: SiteContent,
  headExtra: string,
  runtime: SiteRuntime,
): RenderedFile[] {
  return buildProjectPages(content).flatMap((project) =>
    content.locales.flatMap((locale) => {
      const detail = project.details[locale];

      if (!detail) {
        return [];
      }

      const context = createProjectContext(content, project, detail, locale, runtime);
      const body = [
        theme.renderNav(context),
        theme.renderProject(detail, context),
        theme.renderFooter(context),
      ].join("\n");

      return [
        {
          fileName: getProjectFileName(content, project.slug, locale),
          html: theme.renderDocument(context, body, headExtra),
        },
      ];
    }),
  );
}

function renderLocaleRedirect(defaultLocale: Locale): RenderedFile {
  const target = escapeAttribute(`${defaultLocale}/index.html`);

  return {
    fileName: "index.html",
    html: `<!DOCTYPE html>
<html lang="${escapeAttribute(defaultLocale)}">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=${target}" />
  <link rel="canonical" href="${target}" />
</head>
<body></body>
</html>
`,
  };
}

export function renderSite(
  content: SiteContent,
  headExtra = "",
  runtime: SiteRuntime = {},
): RenderedFile[] {
  const theme = getTheme(content.theme);
  const pages = [
    ...content.locales.flatMap((locale) =>
      content.pages.map((page) => renderPage(theme, content, page, locale, headExtra, runtime)),
    ),
    ...renderProjectPages(theme, content, headExtra, runtime),
  ];

  if (!isMultilingual(content)) {
    return pages;
  }

  return [renderLocaleRedirect(content.defaultLocale), ...pages];
}
