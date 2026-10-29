import { getBlockDefinition, type Block } from "../static-site-generator/blocks/catalog";
import type { Locale } from "../static-site-generator/locale";
import type { SiteContent } from "../static-site-generator/site-content";

export type EditableFieldKind = "text" | "longText" | "image" | "linkLabel";

export type EditableField = {
  path: (string | number)[];
  kind: EditableFieldKind;
  value: string;
};

const longTextKeys = new Set(["body", "description", "quote", "answer"]);
const skippedKeys = new Set(["href", "src", "alt", "credit", "id", "type", "variant"]);
const factKeys = new Set(["eyebrow", "title", "body"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isImage(value: Record<string, unknown>): boolean {
  return typeof value.src === "string" && typeof value.alt === "string";
}

function isLink(value: Record<string, unknown>): boolean {
  return typeof value.label === "string" && typeof value.href === "string";
}

function fieldKind(key: string, value: string): EditableFieldKind {
  return longTextKeys.has(key) || value.length > 80 ? "longText" : "text";
}

function collectFields(
  value: unknown,
  path: (string | number)[],
  key: string,
  fields: EditableField[],
): void {
  if (typeof value === "string") {
    if (!skippedKeys.has(key)) {
      fields.push({ path, kind: fieldKind(key, value), value });
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      collectFields(item, [...path, index], key, fields);
    });
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  if (isImage(value)) {
    fields.push({ path, kind: "image", value: value.src as string });
    return;
  }

  if (isLink(value)) {
    fields.push({
      path: [...path, "label"],
      kind: "linkLabel",
      value: value.label as string,
    });
    return;
  }

  for (const [childKey, child] of Object.entries(value)) {
    if (skippedKeys.has(childKey)) {
      continue;
    }

    collectFields(child, [...path, childKey], childKey, fields);
  }
}

function isFactField(field: EditableField): boolean {
  return factKeys.has(String(field.path[0])) || field.kind === "linkLabel";
}

export function editableFields(block: Block, locale: Locale): EditableField[] {
  const props = (block.props as Record<string, unknown>)[locale];

  if (!isRecord(props)) {
    return [];
  }

  const fields: EditableField[] = [];
  collectFields(props, [], "", fields);

  const kind = getBlockDefinition(block.type)?.kind;

  return kind === "fact" ? fields.filter(isFactField) : fields;
}

function findPage(content: SiteContent, pageId: string) {
  return content.pages.find((page) => page.id === pageId);
}

function setValueAtPath(
  target: Record<string, unknown>,
  path: (string | number)[],
  value: string,
): boolean {
  let current: unknown = target;

  for (let index = 0; index < path.length - 1; index += 1) {
    if (Array.isArray(current)) {
      current = current[path[index] as number];
    } else if (isRecord(current)) {
      current = current[String(path[index])];
    } else {
      return false;
    }
  }

  const last = path[path.length - 1];

  if (Array.isArray(current)) {
    const index = last as number;

    if (current[index] === undefined) {
      return false;
    }

    current[index] = value;
    return true;
  }

  if (isRecord(current) && last in current) {
    current[String(last)] = value;
    return true;
  }

  return false;
}

export function moveBlock(
  content: SiteContent,
  pageId: string,
  blockId: string,
  direction: "up" | "down",
): SiteContent {
  const page = findPage(content, pageId);

  if (!page) {
    return content;
  }

  const index = page.blocks.findIndex((block) => block.id === blockId);

  if (index <= 0) {
    return content;
  }

  const offset = direction === "up" ? -1 : 1;
  let target = index + offset;

  while (target > 0 && target < page.blocks.length && page.blocks[target].hidden) {
    target += offset;
  }

  if (target <= 0 || target >= page.blocks.length) {
    return content;
  }

  const next = structuredClone(content);
  const nextPage = findPage(next, pageId);

  if (!nextPage) {
    return content;
  }

  const [block] = nextPage.blocks.splice(index, 1);
  nextPage.blocks.splice(target, 0, block);

  return next;
}

export function hideBlock(
  content: SiteContent,
  pageId: string,
  blockId: string,
): SiteContent {
  const page = findPage(content, pageId);

  if (!page) {
    return content;
  }

  const index = page.blocks.findIndex((block) => block.id === blockId);

  if (index <= 0) {
    return content;
  }

  const next = structuredClone(content);
  const nextPage = findPage(next, pageId);
  const block = nextPage?.blocks[index];

  if (!block) {
    return content;
  }

  block.hidden = true;
  return next;
}

export function restoreBlock(
  content: SiteContent,
  pageId: string,
  blockId: string,
): SiteContent {
  const page = findPage(content, pageId);

  if (!page) {
    return content;
  }

  const index = page.blocks.findIndex((block) => block.id === blockId);

  if (index < 0) {
    return content;
  }

  const next = structuredClone(content);
  const nextPage = findPage(next, pageId);
  const block = nextPage?.blocks[index];

  if (!block) {
    return content;
  }

  block.hidden = false;
  return next;
}

export function updateBlockProp(
  content: SiteContent,
  pageId: string,
  blockId: string,
  locale: Locale,
  path: (string | number)[],
  value: string,
): SiteContent {
  const page = findPage(content, pageId);
  const block = page?.blocks.find((candidate) => candidate.id === blockId);

  if (!block) {
    return content;
  }

  const next = structuredClone(content);
  const nextPage = findPage(next, pageId);
  const nextBlock = nextPage?.blocks.find((candidate) => candidate.id === blockId);

  if (!nextBlock) {
    return content;
  }

  const props = (nextBlock.props as Record<string, unknown>)[locale];

  if (!isRecord(props) || !setValueAtPath(props, path, value)) {
    return content;
  }

  return next;
}

export function updateBlockImage(
  content: SiteContent,
  pageId: string,
  blockId: string,
  locale: Locale,
  imagePath: (string | number)[],
  src: string,
): SiteContent {
  return updateBlockProp(content, pageId, blockId, locale, [...imagePath, "src"], src);
}

export function pageFileName(
  content: SiteContent,
  pageSlug: string,
  locale: Locale,
): string {
  return content.locales.length > 1
    ? `${locale}/${pageSlug}.html`
    : `${pageSlug}.html`;
}
