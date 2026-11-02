import type { Link } from "../../blocks/common";
import { escapeAttribute, renderText } from "../../content/html";
import type { Tone } from "../../themes/types";

// Tones alternate the near-black base and a slightly lifted band.
export function sectionClasses(tone: Tone, extra = ""): string {
  const band = tone === "light" ? " ar-band" : "";
  return `ar-sec${band}${extra ? ` ${extra}` : ""}`;
}

export function renderArrow(): string {
  return '<svg class="ar-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';
}

// Index numbers only remain in the "rows" alternative designs, as their differentiator.
export function renderIndex(index: number, classes = "ar-index"): string {
  return `<span class="${classes}" dir="ltr">/${String(index + 1).padStart(2, "0")}</span>`;
}

export function renderEyebrow(text: string | undefined): string {
  return text ? `<p class="ar-eyebrow ar-reveal">${renderText(text)}</p>` : "";
}

export function renderHeading(text: string): string {
  return `<h2 class="ar-title ar-reveal">${renderText(text)}</h2>`;
}

export function renderOptionalBody(text: string | undefined, classes = ""): string {
  return text ? `<p class="ar-body ar-reveal ${classes}">${renderText(text)}</p>` : "";
}

export function renderParagraphs(paragraphs: string[]): string {
  return paragraphs.map((paragraph) => `<p class="ar-body ar-reveal">${renderText(paragraph)}</p>`).join("");
}

// Start-aligned block header: the pack never centers its section titles.
export function renderHead(eyebrow: string | undefined, title: string, body: string | undefined): string {
  return `
      <header class="ar-head">
        ${renderEyebrow(eyebrow)}
        ${renderHeading(title)}
        ${renderOptionalBody(body, "ar-head-body")}
      </header>`;
}

// Buttons follow the source: a sand block with no icon.
export function renderButton(link: Link, kind: "solid" | "outline" = "solid"): string {
  const kindClass = kind === "solid" ? "ar-btn-solid" : "ar-btn-outline";

  return `<a href="${escapeAttribute(link.href)}" class="ar-btn ${kindClass}">${renderText(link.label)}</a>`;
}

export function renderTextLink(link: Link | undefined): string {
  if (!link) {
    return "";
  }

  return `<a href="${escapeAttribute(link.href)}" class="ar-link ar-reveal">${renderText(link.label)}${renderArrow()}</a>`;
}

// Counting is an enhancement: the real number stays in the markup and works without JavaScript.
export function renderStatNumber(value: string, classes: string): string {
  const count = /^\d+$/.test(value) ? ` data-count="${escapeAttribute(value)}"` : "";

  return `<div class="ar-num ${classes}"${count}>${renderText(value)}</div>`;
}

const iconShapes: Record<string, string> = {
  layers: '<path d="M2 5.5L8 2.5l6 3-6 3z"/><path d="M2 8.5l6 3 6-3M2 11.5l6 3 6-3"/>',
  pen: '<path d="M2 14l2.6-.6 8.3-8.3a1.5 1.5 0 00-2.1-2.1L2.5 11.3z"/>',
  cube: '<path d="M8 2l5.5 3v6L8 14l-5.5-3V5z"/><path d="M2.5 5L8 8l5.5-3M8 8v6"/>',
  building: '<path d="M4 14V3h8v11M2.5 14h11M6.5 6h1M9 6h1M6.5 9h1M9 9h1M6.5 11.5h1M9 11.5h1"/>',
  ruler: '<path d="M2 6L6 2l8 8-4 4z"/><path d="M6 4l1 1M8 6l1 1M10 8l1 1"/>',
  compass: '<circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 2"/>',
};

const iconOrder = Object.keys(iconShapes);

const iconAliases: Record<string, string> = {
  "building-2": "building",
  landmark: "building",
  factory: "building",
  hotel: "building",
  "pencil-ruler": "ruler",
  compass: "compass",
  "drafting-compass": "compass",
  sofa: "compass",
  armchair: "compass",
  house: "building",
  bed: "compass",
  trees: "layers",
  sprout: "layers",
  "layout-grid": "layers",
  "pen-tool": "pen",
  edit: "pen",
};

function pickIcon(name: string | undefined, index: number): string {
  const key = name ? (iconAliases[name] ?? name) : "";

  return iconShapes[key] ?? iconShapes[iconOrder[index % iconOrder.length]];
}

// Line icons are inline SVG. Unknown names fall back to a shape picked by position.
export function renderIcon(name: string | undefined, index: number, classes = "ar-icon"): string {
  return `<svg class="${classes}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true" focusable="false">${pickIcon(name, index)}</svg>`;
}

export function renderStars(rating: number, label: string): string {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  return `<span role="img" aria-label="${escapeAttribute(label)}" class="ar-stars">${stars}</span>`;
}
