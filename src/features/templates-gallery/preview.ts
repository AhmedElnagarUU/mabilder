import { readFile } from "node:fs/promises";
import path from "node:path";
import { applyTemplate } from "../site-editor/apply-template";
import { localeSchema, type Locale } from "../static-site-generator/locale";
import { renderSite } from "../static-site-generator/render-site";
import {
  getTemplate,
  isTemplateId,
  listTemplates,
} from "../static-site-generator/site-templates/registry";
import { getThemeAssetsDirectory } from "../static-site-generator/site-paths";
import { getTheme } from "../static-site-generator/themes/registry";
import { demoContentFor } from "./demo/demo-content";

// Preview rendering for the templates gallery: the demo content rendered with one template and
// served from one route handler. Pure and cache-friendly: no AI, no Pexels, no database, no session.

export type PreviewPage = {
  base: string;
  html: string;
};

export type PreviewAsset = {
  content: string;
  contentType: string;
};

const assetContentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

export function previewLocales(): Locale[] {
  return localeSchema.options ?? ["en", "ar"];
}

export function previewTemplateIds(): string[] {
  return listTemplates().map((template) => template.id);
}

// Everything the file tree of a rendered demo contains, in the URL shape of the preview route:
// [""] for the home page, the locale folder for page and project pages, and the theme's assets.
export function listPreviewParams(): { locale: Locale; id: string; file: string[] }[] {
  return previewTemplateIds().flatMap((id) => {
    const content = demoContentFor(id);

    return previewLocales().flatMap((locale) => {
      const pages = content.pages.flatMap((page) =>
        content.locales.includes(locale) ? [`${page.slug}.html`] : [],
      );
      const projectFiles = renderSite(content)
        .filter(
          (file) =>
            file.fileName.startsWith(`${content.defaultLocale}/projects/`) &&
            file.fileName.endsWith(".html"),
        )
        .map((file) => [locale, file.fileName.replace(`${content.defaultLocale}/`, "")] as const);
      const assets = getTheme(getTemplate(id).shell).assets.map((asset) => ["assets", asset] as const);

      return [
        { locale, id, file: [] },
        ...pages.map((name) => ({ locale, id, file: [locale, name] })),
        ...projectFiles.map(([folder, name]) => ({ locale, id, file: [folder, name] })),
        ...assets.map((file) => ({ locale, id, file: [...file] })),
      ];
    });
  });
}

// The demo file the URL points at. `segments` is the optional catch-all path after "/preview".
// `templateId` and `locale` arrive as raw strings from the route params and are validated here.
export function findPreviewPage(
  templateId: string,
  locale: string,
  segments: string[] | undefined,
): PreviewPage | null {
  if (!isTemplateId(templateId) || !previewLocales().some((candidate) => candidate === locale)) {
    return null;
  }

  const fileName = resolvePreviewFileName(locale, segments);

  if (fileName === null) {
    return null;
  }

  const file = renderSite(applyTemplate(demoContentFor(templateId), templateId)).find(
    (candidate) => candidate.fileName === fileName,
  );

  if (!file) {
    return null;
  }

  // Relative demo links (about.html, projects/<slug>.html, ../assets/site.css) stay untouched:
  // the base href makes them resolve inside the preview route without changing template output.
  const base = `/${locale}/templates/${templateId}/preview/${locale}/`;

  return { base, html: withBase(file.html, base) };
}

function resolvePreviewFileName(locale: string, segments: string[] | undefined): string | null {
  if (segments === undefined || segments.length === 0 || (segments.length === 1 && segments[0] === "")) {
    return `${locale}/index.html`;
  }

  if (segments[0] !== locale) {
    return null;
  }

  const name = segments.slice(1).join("/");
  // Only rendered pages can be served: the redirect root and unknown paths stay 404.
  return name.endsWith(".html") && !name.includes("..") ? `${locale}/${name}` : null;
}

function withBase(html: string, base: string): string {
  return html.replace("<head>", `<head>\n  <base href="${base}">`);
}

export async function findPreviewAsset(
  templateId: string,
  locale: string,
  segments: string[] | undefined,
): Promise<PreviewAsset | null> {
  if (!isTemplateId(templateId) || !previewLocales().some((candidate) => candidate === locale)) {
    return null;
  }

  if (!segments || segments.length < 2 || segments[0] !== "assets") {
    return null;
  }

  const name = segments.slice(1).join("/");
  const theme = getTheme(getTemplate(templateId).shell);

  if (!theme.assets.includes(name)) {
    return null;
  }

  try {
    const content = await readFile(path.join(getThemeAssetsDirectory(theme.id), name), "utf8");
    const contentType = assetContentTypes[path.extname(name)];

    if (!contentType) {
      return null;
    }

    return { content, contentType };
  } catch {
    return null;
  }
}
