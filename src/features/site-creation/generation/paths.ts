import {
  getAtPath,
  isContentObject,
  setAtPath,
  type ContentNode,
  type ContentPath,
} from "../../static-site-generator/content/content-tree";
import {
  parseContentPath,
  pathToString,
  type TextPathEntry,
} from "../../static-site-generator/content/content-inline";
import type { SiteContent } from "../../static-site-generator/content/types";

export type PageKey =
  | "home"
  | "about"
  | "services"
  | "work"
  | "profile"
  | "contact";

const hiddenKeys = new Set([
  "href",
  "src",
  "icon",
  "variant",
  "id",
  "menuLabel",
]);

function isHiddenKey(key: string): boolean {
  return hiddenKeys.has(key) || key.endsWith("Href");
}

function collectEntries(
  node: ContentNode,
  path: ContentPath = [],
): TextPathEntry[] {
  if (typeof node === "string") {
    return [{ path, text: node }];
  }

  if (Array.isArray(node)) {
    return node.flatMap((child, index) =>
      collectEntries(child, [...path, index]),
    );
  }

  if (!isContentObject(node)) {
    return [];
  }

  return Object.entries(node).flatMap(([key, child]) => {
    if (isHiddenKey(key)) {
      return [];
    }

    return collectEntries(child, [...path, key]);
  });
}

function isCodeOwnedPath(path: string): boolean {
  if (path === "site.name") {
    return true;
  }

  if (path.startsWith("footer.social.") || path.startsWith("footer.studios.")) {
    return true;
  }

  if (
    path === "pages.home.contact.email" ||
    path === "pages.home.contact.phone" ||
    path === "pages.home.contact.address" ||
    path === "pages.contact.enquiry.email" ||
    path === "pages.profile.careers.email"
  ) {
    return true;
  }

  if (path.startsWith("pages.contact.offices.items.")) {
    return (
      path.endsWith(".tag") ||
      path.endsWith(".city") ||
      path.endsWith(".timezone") ||
      path.endsWith(".email") ||
      path.endsWith(".phone") ||
      path.endsWith(".directions") ||
      path.endsWith(".mapLabel") ||
      path.includes(".address.")
    );
  }

  if (
    path.startsWith("pages.contact.methods.") &&
    path.endsWith(".value")
  ) {
    return true;
  }

  if (
    path.startsWith("pages.contact.departments.items.") &&
    path.endsWith(".email")
  ) {
    return true;
  }

  if (
    path.startsWith("pages.about.timeline.items.") &&
    (path.endsWith(".year") || path.endsWith(".title"))
  ) {
    return true;
  }

  if (
    path.startsWith("pages.about.awards.items.") &&
    (path.endsWith(".year") || path.endsWith(".title"))
  ) {
    return true;
  }

  if (path.startsWith("pages.work.clients.names.")) {
    return true;
  }

  if (path.startsWith("pages.work.grid.filters.0.")) {
    return true;
  }

  if (
    path.startsWith("pages.work.grid.filters.") &&
    path.endsWith(".value")
  ) {
    return true;
  }

  return false;
}

export function collectAiTextPaths(
  node: ContentNode,
  prefix: ContentPath = [],
): TextPathEntry[] {
  return collectEntries(node)
    .map((entry) => ({
      path: [...prefix, ...entry.path],
      text: entry.text,
    }))
    .filter((entry) => !isCodeOwnedPath(pathToString(entry.path)));
}

export function collectPagePaths(
  pageKey: PageKey,
  content: SiteContent,
): string[] {
  const entries = collectAiTextPaths(content.pages[pageKey], [
    "pages",
    pageKey,
  ]);

  if (pageKey === "home") {
    entries.push(...collectAiTextPaths(content.site, ["site"]));
    entries.push(...collectAiTextPaths(content.navigation, ["navigation"]));
    entries.push(...collectAiTextPaths(content.footer, ["footer"]));
  }

  return entries.map((entry) => pathToString(entry.path));
}

export function mergeEntries(
  content: SiteContent,
  entries: Map<string, string>,
): SiteContent {
  let next: ContentNode = content;

  for (const [path, text] of entries) {
    const parsed = parseContentPath(path);

    if (typeof getAtPath(next, parsed) !== "string") {
      continue;
    }

    next = setAtPath(next, parsed, text);
  }

  return next as SiteContent;
}
