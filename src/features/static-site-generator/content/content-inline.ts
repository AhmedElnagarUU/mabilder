import {
  getAtPath,
  isContentObject,
  type ContentNode,
  type ContentPath,
} from "./content-tree";

export type TextPathEntry = {
  path: ContentPath;
  text: string;
};

export type ImagePathEntry = {
  path: ContentPath;
  src: string;
};

const hiddenKeys = new Set([
  "href",
  "src",
  "alt",
  "icon",
  "variant",
  "id",
  "menuLabel",
]);

function isHiddenKey(key: string, value: ContentNode): boolean {
  if (
    key === "meta" &&
    isContentObject(value) &&
    typeof value.title === "string" &&
    typeof value.description === "string"
  ) {
    return true;
  }

  return (
    hiddenKeys.has(key) ||
    key.endsWith("Href") ||
    key.endsWith("Placeholder")
  );
}

export function parseContentPath(value: string): ContentPath {
  return value
    .split(".")
    .filter(Boolean)
    .map((segment) =>
      /^\d+$/.test(segment) ? Number(segment) : segment,
    );
}

export function pathToString(path: ContentPath): string {
  return path.join(".");
}

export function normalizeInlineText(value: string): string {
  return value.replaceAll("*", "").replace(/\s+/g, " ").trim();
}

export function collectTextPaths(
  node: ContentNode,
  path: ContentPath = [],
): TextPathEntry[] {
  if (typeof node === "string") {
    return [{ path, text: node }];
  }

  if (Array.isArray(node)) {
    return node.flatMap((child, index) =>
      collectTextPaths(child, [...path, index]),
    );
  }

  if (!isContentObject(node)) {
    return [];
  }

  return Object.entries(node).flatMap(([key, child]) => {
    if (isHiddenKey(key, child)) {
      return [];
    }

    return collectTextPaths(child, [...path, key]);
  });
}

export function collectImagePaths(
  node: ContentNode,
  path: ContentPath = [],
): ImagePathEntry[] {
  if (Array.isArray(node)) {
    return node.flatMap((child, index) =>
      collectImagePaths(child, [...path, index]),
    );
  }

  if (!isContentObject(node)) {
    return [];
  }

  return Object.entries(node).flatMap(([key, child]) => {
    if (key === "src" && typeof child === "string") {
      return [{ path: [...path, key], src: child }];
    }

    return collectImagePaths(child, [...path, key]);
  });
}

function serializeNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const element = node as HTMLElement;
  const tag = element.tagName.toLowerCase();

  if (tag === "br") {
    return "\n";
  }

  if (tag === "svg" || tag === "script" || tag === "style") {
    return "";
  }

  if (tag === "em" || tag === "i" || tag === "b" || tag === "strong") {
    const inner = serializeChildren(element);
    return inner.trim() ? `*${inner}*` : "";
  }

  if (tag === "div" || tag === "p" || tag === "li") {
    return `\n${serializeChildren(element)}`;
  }

  return serializeChildren(element);
}

function serializeChildren(element: HTMLElement): string {
  return Array.from(element.childNodes).map(serializeNode).join("");
}

export function serializeEditable(element: HTMLElement): string {
  return serializeChildren(element)
    .replaceAll("\u00a0", " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s+|\s+$/g, "");
}

const ignoredTags = new Set([
  "SCRIPT",
  "STYLE",
  "SVG",
  "NOSCRIPT",
  "TEMPLATE",
  "IFRAME",
  "CANVAS",
]);

const blockTags = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "DD",
  "DIV",
  "DL",
  "DT",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "SECTION",
  "TABLE",
  "TD",
  "TH",
  "TR",
  "UL",
]);

function elementText(element: Element): string {
  let text = "";

  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? "";
      continue;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      continue;
    }

    const child = node as HTMLElement;
    const tag = child.tagName.toLowerCase();

    if (tag === "br") {
      text += " ";
      continue;
    }

    if (tag === "script" || tag === "style" || tag === "svg") {
      continue;
    }

    text += elementText(child);

    if (blockTags.has(child.tagName)) {
      text += " ";
    }
  }

  return text;
}

function candidateText(element: Element): string {
  return normalizeInlineText(elementText(element));
}

function textCandidates(section: HTMLElement): HTMLElement[] {
  return [section, ...Array.from(section.querySelectorAll<HTMLElement>("*"))]
    .filter((element) => {
      if (ignoredTags.has(element.tagName)) {
        return false;
      }

      if (element.closest("[data-section]") !== section) {
        return false;
      }

      const text = candidateText(element);

      if (!text) {
        return false;
      }

      return !Array.from(element.children).some(
        (child) => candidateText(child) === text,
      );
    });
}

function annotateSection(
  section: HTMLElement,
  value: ContentNode,
  prefix: ContentPath,
): void {
  const textEntries = collectTextPaths(value)
    .map((entry) => ({
      path: pathToString([...prefix, ...entry.path]),
      text: normalizeInlineText(entry.text),
    }))
    .filter((entry) => entry.text.length > 0);

  const candidates = textCandidates(section);
  const used = new Set<number>();

  for (const element of candidates) {
    const text = candidateText(element);
    const index = textEntries.findIndex(
      (entry, entryIndex) => !used.has(entryIndex) && entry.text === text,
    );

    if (index === -1) {
      continue;
    }

    used.add(index);
    element.setAttribute("data-agenvo-text", textEntries[index].path);
  }

  // Content rendered more than once (for example desktop and mobile nav links)
  // should still resolve to the same content path.
  for (const element of candidates) {
    if (element.hasAttribute("data-agenvo-text")) {
      continue;
    }

    const text = candidateText(element);
    const entry = textEntries.find((item) => item.text === text);

    if (entry) {
      element.setAttribute("data-agenvo-text", entry.path);
    }
  }

  for (const counter of Array.from(
    section.querySelectorAll<HTMLElement>("[data-count]"),
  )) {
    if (counter.closest("[data-section]") !== section) {
      continue;
    }

    const text = normalizeInlineText(counter.getAttribute("data-count") ?? "");
    const entry =
      textEntries.find(
        (item) => item.text === text && item.path.endsWith(".value"),
      ) ?? textEntries.find((item) => item.text === text);

    if (entry) {
      counter.setAttribute("data-agenvo-text", entry.path);
    }
  }

  const imageEntries = collectImagePaths(value).map((entry) => ({
    path: pathToString([...prefix, ...entry.path]),
    src: entry.src,
  }));
  const images = Array.from(
    section.querySelectorAll<HTMLImageElement>("img"),
  ).filter((image) => image.closest("[data-section]") === section);
  const usedImages = new Set<number>();

  for (const image of images) {
    const src = image.getAttribute("src") ?? "";
    const index = imageEntries.findIndex(
      (entry, entryIndex) => !usedImages.has(entryIndex) && entry.src === src,
    );

    if (index === -1) {
      continue;
    }

    usedImages.add(index);
    image.setAttribute("data-agenvo-image", imageEntries[index].path);
  }

  for (const image of images) {
    if (image.hasAttribute("data-agenvo-image")) {
      continue;
    }

    const src = image.getAttribute("src") ?? "";
    const entry = imageEntries.find((item) => item.src === src);

    if (entry) {
      image.setAttribute("data-agenvo-image", entry.path);
    }
  }
}

export function annotateDocument(doc: Document, content: ContentNode): void {
  for (const element of Array.from(
    doc.querySelectorAll("[data-agenvo-text], [data-agenvo-image]"),
  )) {
    element.removeAttribute("data-agenvo-text");
    element.removeAttribute("data-agenvo-image");
  }

  for (const section of Array.from(
    doc.querySelectorAll<HTMLElement>("[data-section]"),
  )) {
    const path = section.getAttribute("data-section");

    if (!path) {
      continue;
    }

    const value = getAtPath(content, parseContentPath(path));

    if (value === undefined) {
      continue;
    }

    annotateSection(section, value, parseContentPath(path));
  }
}
