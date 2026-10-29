import type { Block } from "../static-site-generator/blocks/catalog";
import type { Locale } from "../static-site-generator/locale";
import type { Page, SiteContent } from "../static-site-generator/site-content";
import { editableFields, type EditableField } from "./content-ops";
import { fieldPathKey, findBlockElement } from "./preview-document";

function hasMatchingDescendant(element: HTMLElement, value: string): boolean {
  return Array.from(element.querySelectorAll<HTMLElement>("*")).some(
    (child) => (child.textContent ?? "").trim() === value,
  );
}

function findCounter(
  section: HTMLElement,
  value: string,
  used: Set<HTMLElement>,
): HTMLElement | null {
  return (
    Array.from(section.querySelectorAll<HTMLElement>("[data-count]")).find(
      (element) => !used.has(element) && element.dataset.count === value,
    ) ?? null
  );
}

function findTextTarget(
  section: HTMLElement,
  targets: HTMLElement[],
  value: string,
  used: Set<HTMLElement>,
): HTMLElement | null {
  const counter = findCounter(section, value, used);

  if (counter) {
    return counter;
  }

  return (
    targets.find(
      (element) =>
        !used.has(element) &&
        (element.textContent ?? "").trim() === value &&
        !hasMatchingDescendant(element, value),
    ) ?? null
  );
}

function findImageTarget(
  section: HTMLElement,
  src: string,
  used: Set<HTMLElement>,
): HTMLElement | null {
  return (
    Array.from(section.querySelectorAll<HTMLElement>("img")).find(
      (element) => !used.has(element) && element.getAttribute("src") === src,
    ) ?? null
  );
}

function markTarget(element: HTMLElement, field: EditableField): void {
  element.setAttribute("data-field", fieldPathKey(field.path));
  element.setAttribute("data-field-kind", field.kind);
}

function annotateSection(section: HTMLElement, block: Block, locale: Locale): void {
  section.querySelectorAll<HTMLElement>("[data-field]").forEach((element) => {
    element.removeAttribute("data-field");
    element.removeAttribute("data-field-kind");
  });

  const targets = Array.from(section.querySelectorAll<HTMLElement>("*")).filter(
    (element) => (element.textContent ?? "").trim().length > 0,
  );
  const used = new Set<HTMLElement>();

  for (const field of editableFields(block, locale)) {
    const target =
      field.kind === "image"
        ? findImageTarget(section, field.value, used)
        : findTextTarget(section, targets, field.value, used);

    if (!target) {
      continue;
    }

    markTarget(target, field);
    used.add(target);
  }
}

export function annotateDocument(
  doc: Document,
  content: SiteContent,
  page: Page,
  locale: Locale,
): void {
  for (const block of page.blocks) {
    if (block.hidden) {
      continue;
    }

    const section = findBlockElement(doc, block.id);

    if (section) {
      annotateSection(section, block, locale);
    }
  }
}
