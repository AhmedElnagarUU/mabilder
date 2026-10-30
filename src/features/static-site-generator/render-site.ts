import type { Block, BlockType } from "./blocks/catalog";
import { imageSchema } from "./blocks/common";
import { escapeAttribute } from "./content/html";
import {
  buildProjectPages,
  type ProjectDetail,
  type ProjectPage,
} from "./content/project-pages";
import type { Locale } from "./locale";
import type { Page, SiteContent } from "./site-content";
import { getTheme } from "./themes/registry";
import type {
  AlternatePage,
  BlockContext,
  BlockRenderer,
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

  return { id: block.id, type: block.type, variant: block.variant, props } as ThemeBlock;
}

function getVisibleBlocks(theme: Theme, page: Page, locale: Locale): ThemeBlock[] {
  return page.blocks
    .filter((block) => !block.hidden && theme.blocks[block.type] !== undefined)
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
  };
}

export function renderBlock(theme: Theme, block: ThemeBlock, context: BlockContext): string {
  const render = theme.blocks[block.type] as BlockRenderer<BlockType> | undefined;

  if (!render) {
    throw new Error(`Theme "${theme.id}" cannot render block type "${block.type}".`);
  }

  return render(block, context);
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
): RenderedFile {
  const blocks = getVisibleBlocks(theme, page, locale);
  const context = createPageContext(content, page, locale, blocks);
  const body = [
    theme.renderNav(context),
    ...blocks.map((block, index) =>
      renderBlock(theme, block, { ...context, tone: getTone(theme, index) }),
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
): PageContext {
  const page = content.pages.find((candidate) => candidate.slug === "projects") ?? content.pages[0];
  const base = createPageContext(content, page, locale, []);
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
): RenderedFile[] {
  return buildProjectPages(content).flatMap((project) =>
    content.locales.flatMap((locale) => {
      const detail = project.details[locale];

      if (!detail) {
        return [];
      }

      const context = createProjectContext(content, project, detail, locale);
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

export function renderSite(content: SiteContent, headExtra = ""): RenderedFile[] {
  const theme = getTheme(content.theme);
  const pages = [
    ...content.locales.flatMap((locale) =>
      content.pages.map((page) => renderPage(theme, content, page, locale, headExtra)),
    ),
    ...renderProjectPages(theme, content, headExtra),
  ];

  if (!isMultilingual(content)) {
    return pages;
  }

  return [renderLocaleRedirect(content.defaultLocale), ...pages];
}
