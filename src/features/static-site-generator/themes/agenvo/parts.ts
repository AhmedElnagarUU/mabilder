import type { Image, Link } from "../../blocks/common";
import { escapeAttribute, renderText } from "../../content/html";
import type { ThemeBlock, Tone } from "../types";

export type ToneStyle = {
  section: string;
  body: string;
  muted: string;
  border: string;
  divide: string;
  field: string;
};

const toneStyles: Record<Tone, ToneStyle> = {
  light: {
    section: "bg-cream text-charcoal",
    body: "text-gray-600",
    muted: "text-gray-500",
    border: "border-charcoal/10",
    divide: "divide-charcoal/10",
    field: "form-field light-field",
  },
  dark: {
    section: "bg-charcoal text-cream",
    body: "text-white/50",
    muted: "text-white/40",
    border: "border-white/10",
    divide: "divide-white/10",
    field: "form-field",
  },
};

export const sectionPadding = "py-24 lg:py-32 px-6 md:px-10 lg:px-16";

export function getToneStyle(tone: Tone): ToneStyle {
  return toneStyles[tone];
}

export function renderSection(
  block: ThemeBlock,
  classes: string,
  inner: string,
  anchorId?: string,
): string {
  const anchor = anchorId ? ` id="${escapeAttribute(anchorId)}"` : "";

  return `
  <section data-block="${escapeAttribute(block.id)}" data-block-type="${escapeAttribute(block.type)}"${anchor} class="${classes}">${inner}
  </section>`;
}

export function renderEyebrow(text: string | undefined): string {
  if (!text) {
    return "";
  }

  return `<p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(text)}</p>`;
}

export function renderTitle(text: string, classes = "text-4xl md:text-5xl leading-tight"): string {
  return `<h2 class="font-display ${classes} reveal">${renderText(text)}</h2>`;
}

export function renderOptionalBody(text: string | undefined, classes: string): string {
  if (!text) {
    return "";
  }

  return `<p class="text-sm leading-relaxed ${classes} reveal">${renderText(text)}</p>`;
}

export function renderParagraphs(paragraphs: string[], classes: string): string {
  return paragraphs
    .map((paragraph) => `<p class="leading-relaxed ${classes} reveal">${renderText(paragraph)}</p>`)
    .join("\n        ");
}

export function renderTextLink(link: Link | undefined, classes = "mt-8"): string {
  if (!link) {
    return "";
  }

  return `<a href="${escapeAttribute(link.href)}" class="inline-flex items-center gap-2 ${classes} text-[11px] uppercase tracking-[0.2em] text-brass link-underline reveal">${renderText(link.label)} <i data-lucide="arrow-up-right" class="w-3.5 h-3.5 rtl:-scale-x-100"></i></a>`;
}

export function renderButton(link: Link, classes: string): string {
  return `<a href="${escapeAttribute(link.href)}" class="inline-flex items-center gap-3 ${classes} text-[11px] uppercase tracking-[0.2em] px-8 py-4 transition">${renderText(link.label)} <i data-lucide="arrow-right" class="w-4 h-4 rtl:rotate-180"></i></a>`;
}

export function renderImage(image: Image, classes: string): string {
  return `<img src="${escapeAttribute(image.src)}" alt="${escapeAttribute(image.alt)}" loading="lazy" class="${classes}" />`;
}

export function renderHeader(
  eyebrow: string | undefined,
  title: string,
  body: string | undefined,
  style: ToneStyle,
): string {
  return `
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          ${renderEyebrow(eyebrow)}
          ${renderTitle(title)}
        </div>
        ${renderOptionalBody(body, `${style.body} max-w-sm`)}
      </div>`;
}

export function stepNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export function renderCounter(value: string, classes: string): string {
  if (/^\d+$/.test(value)) {
    return `<div class="font-display ${classes} counter" data-count="${escapeAttribute(value)}">0</div>`;
  }

  return `<div class="font-display ${classes} counter">${renderText(value)}</div>`;
}
