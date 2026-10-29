import { renderSite } from "../static-site-generator/render-site";
import type { Locale } from "../static-site-generator/locale";
import type { SiteContent } from "../static-site-generator/site-content";
import { pageFileName } from "./content-ops";

export type OverlayBounds = {
  width: number;
  height: number;
};

export type OverlayRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function fieldPathKey(path: (string | number)[]): string {
  return JSON.stringify(path);
}

export function buildPreviewDocument(
  content: SiteContent,
  siteId: string,
  pageSlug: string,
  locale: Locale,
): string {
  const file = renderSite(content).find(
    (candidate) => candidate.fileName === pageFileName(content, pageSlug, locale),
  );

  if (!file) {
    return "";
  }

  const slash = file.fileName.lastIndexOf("/");
  const directory = slash === -1 ? "" : file.fileName.slice(0, slash + 1);

  return file.html.replace(
    "<head>",
    `<head>\n  <base href="/preview/${siteId}/${directory}">`,
  );
}

export function parseInternalLink(
  href: string,
  content: SiteContent,
): { slug: string; locale?: Locale } | null {
  const [pathPart] = href.split("#");

  if (!pathPart || /^[a-z]+:/i.test(pathPart)) {
    return null;
  }

  const segments = pathPart
    .split("/")
    .filter((segment) => segment && segment !== "." && segment !== "..");
  const file = segments[segments.length - 1];

  if (!file || !file.endsWith(".html")) {
    return null;
  }

  const slug = file.slice(0, -".html".length);

  if (!content.pages.some((page) => page.slug === slug)) {
    return null;
  }

  const first = segments[0];
  const locale = content.locales.find((candidate) => candidate === first);

  return { slug, locale };
}

export function findBlockElement(doc: Document, blockId: string): HTMLElement | null {
  return (
    Array.from(doc.querySelectorAll<HTMLElement>("[data-block]")).find(
      (element) => element.dataset.block === blockId,
    ) ?? null
  );
}

export function findFieldElement(
  root: ParentNode,
  path: (string | number)[],
): HTMLElement | null {
  const key = fieldPathKey(path);

  return (
    Array.from(root.querySelectorAll<HTMLElement>("[data-field]")).find(
      (element) => element.getAttribute("data-field") === key,
    ) ?? null
  );
}

export function rectOf(element: Element, scale: number): OverlayRect {
  const rect = element.getBoundingClientRect();

  return {
    top: rect.top * scale,
    left: rect.left * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };
}

export function paintSelection(doc: Document, blockId: string | null): void {
  doc.querySelectorAll<HTMLElement>("[data-block]").forEach((element) => {
    if (blockId && element.dataset.block === blockId) {
      element.setAttribute("data-editor-selected", "true");
    } else {
      element.removeAttribute("data-editor-selected");
    }
  });
}

export function paintFocus(doc: Document, blockId: string | null): HTMLElement | null {
  doc.querySelectorAll<HTMLElement>("[data-editor-focused]").forEach((element) => {
    element.removeAttribute("data-editor-focused");
  });

  const section = blockId ? findBlockElement(doc, blockId) : null;

  if (!section) {
    doc.body.removeAttribute("data-editor-focus");
    return null;
  }

  section.setAttribute("data-editor-focused", "true");
  section.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
  doc.body.setAttribute("data-editor-focus", "true");
  return section;
}

export function createRenderedSection(
  doc: Document,
  content: SiteContent,
  pageSlug: string,
  blockId: string,
  locale: Locale,
): HTMLElement | null {
  const file = renderSite(content).find(
    (candidate) => candidate.fileName === pageFileName(content, pageSlug, locale),
  );

  if (!file) {
    return null;
  }

  const parsed = new DOMParser().parseFromString(file.html, "text/html");
  const section = Array.from(
    parsed.querySelectorAll<HTMLElement>("section[data-block]"),
  ).find((element) => element.dataset.block === blockId);

  return section ? (doc.importNode(section, true) as HTMLElement) : null;
}
