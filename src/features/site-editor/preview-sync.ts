import type { Locale } from "../static-site-generator/locale";
import type { Page, SiteContent } from "../static-site-generator/site-content";
import { editableFields } from "./content-ops";
import {
  createRenderedSection,
  findBlockElement,
  findFieldElement,
} from "./preview-document";

type LucideWindow = Window & { lucide?: { createIcons: () => void } };

const editorStyle = `
body[data-editor-focus] > *:not(script):not(style):not([data-editor-focused]) { display: none !important; }
body[data-editor-focus] [data-field] { cursor: text; }
body[data-editor-focus] [data-field-kind="image"] { cursor: pointer; }
body[data-editor-focus] [data-field]:hover { outline: 2px solid rgba(94, 234, 212, 0.65); outline-offset: 2px; }
[data-block][data-editor-selected="true"] { outline: 2px solid #5eead4; outline-offset: -2px; }
[data-editor-editing] { outline: 2px solid #5eead4 !important; outline-offset: 2px; background: rgba(94, 234, 212, 0.08); cursor: text; }
html { scrollbar-width: none; }
html::-webkit-scrollbar { display: none; }
`;

export function injectEditorStyle(doc: Document): void {
  if (doc.getElementById("site-editor-style")) {
    return;
  }

  const style = doc.createElement("style");
  style.id = "site-editor-style";
  style.textContent = editorStyle;
  doc.head.appendChild(style);
}

export function refreshIcons(doc: Document): void {
  const view = doc.defaultView as LucideWindow | null;
  view?.lucide?.createIcons();
}

export function placeCaretAtEnd(element: HTMLElement): void {
  const selection = element.ownerDocument.getSelection();

  if (!selection) {
    return;
  }

  const range = element.ownerDocument.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
}

export function parseFieldPath(raw: string | undefined): (string | number)[] | null {
  if (!raw) {
    return null;
  }

  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? (value as (string | number)[]) : null;
  } catch {
    return null;
  }
}

export function syncPreviewSections(
  doc: Document,
  content: SiteContent,
  page: Page,
  locale: Locale,
): boolean {
  const footer = doc.body.querySelector("footer");
  const visible = page.blocks.filter((block) => !block.hidden);
  const expected = new Set(visible.map((block) => block.id));

  doc.querySelectorAll<HTMLElement>("body > section[data-block]").forEach((section) => {
    if (!expected.has(section.dataset.block ?? "")) {
      section.remove();
    }
  });

  let changed = false;

  for (const block of visible) {
    if (findBlockElement(doc, block.id)) {
      continue;
    }

    const section = createRenderedSection(doc, content, page.slug, block.id, locale);

    if (!section) {
      continue;
    }

    section.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));

    if (footer) {
      doc.body.insertBefore(section, footer);
    } else {
      doc.body.appendChild(section);
    }

    changed = true;
  }

  const ordered = visible
    .map((block) => findBlockElement(doc, block.id))
    .filter((section): section is HTMLElement => section !== null);
  const current = Array.from(
    doc.querySelectorAll<HTMLElement>("body > section[data-block]"),
  );
  const sameOrder =
    ordered.length === current.length &&
    ordered.every((section, index) => section === current[index]);

  if (!sameOrder) {
    ordered.forEach((section) => {
      if (footer) {
        doc.body.insertBefore(section, footer);
      } else {
        doc.body.appendChild(section);
      }
    });
    changed = true;
  }

  return changed;
}

export function patchPreviewFields(
  doc: Document,
  page: Page,
  locale: Locale,
  editingElement: HTMLElement | null,
): void {
  for (const block of page.blocks) {
    if (block.hidden) {
      continue;
    }

    const section = findBlockElement(doc, block.id);

    if (!section) {
      continue;
    }

    for (const field of editableFields(block, locale)) {
      const element = findFieldElement(section, field.path);

      if (!element || element === editingElement) {
        continue;
      }

      if (field.kind === "image") {
        if (element.getAttribute("src") !== field.value) {
          element.setAttribute("src", field.value);
        }
        continue;
      }

      if ((element.textContent ?? "").trim() !== field.value) {
        element.textContent = field.value;
      }

      if (element.dataset.count !== undefined) {
        element.dataset.count = field.value;
      }
    }
  }
}
