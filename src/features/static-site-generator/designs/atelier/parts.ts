import type { Link } from "../../blocks/common";
import { escapeAttribute, renderText } from "../../content/html";
import type { Tone } from "../../themes/types";

const arrow =
  '<svg class="at-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true" focusable="false"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';

// Sections alternate the paper and a slightly deeper paper tint.
export function sectionClasses(tone: Tone, extra = ""): string {
  const tint = tone === "dark" ? " at-tint" : "";
  return `at-sec${tint}${extra ? ` ${extra}` : ""}`;
}

// Signature: the last word of a title is set in italic accent. Titles with their own *accent* marks keep them.
export function renderAccentTitle(title: string): string {
  if (title.includes("*")) {
    return renderText(title);
  }

  const lines = title.split("\n");
  const last = lines[lines.length - 1].trimEnd();
  const words = last.split(/\s+/);

  if (words.length < 2) {
    return renderText(title);
  }

  const head = [...lines.slice(0, -1), words.slice(0, -1).join(" ")].map(renderText).join("<br />");
  const tail = words[words.length - 1];

  return `${head} <em>${renderText(tail)}</em>`;
}

export function renderEyebrow(text: string | undefined): string {
  return text ? `<p class="at-eyebrow at-reveal">${renderText(text)}</p>` : "";
}

export function renderHeading(text: string, classes = ""): string {
  return `<h2 class="at-title at-reveal${classes ? ` ${classes}` : ""}">${renderAccentTitle(text)}</h2>`;
}

export function renderOptionalBody(text: string | undefined): string {
  return text ? `<p class="at-body at-reveal">${renderText(text)}</p>` : "";
}

export function renderParagraphs(paragraphs: string[]): string {
  return paragraphs.map((paragraph) => `<p class="at-body at-reveal">${renderText(paragraph)}</p>`).join("");
}

// Signature: a rotated label that runs along the side of the section.
export function renderSideLabel(text: string | undefined): string {
  return text ? `<p class="at-side-label" aria-hidden="true">${renderText(text)}</p>` : "";
}

export function renderHead(eyebrow: string | undefined, title: string, body: string | undefined): string {
  return `
      <header class="at-head">
        ${renderEyebrow(eyebrow)}
        ${renderHeading(title)}
        ${renderOptionalBody(body)}
      </header>`;
}

export function renderButton(link: Link, kind: "solid" | "line" = "solid"): string {
  return `<a href="${escapeAttribute(link.href)}" class="at-btn at-btn-${kind}">${renderText(link.label)}${arrow}</a>`;
}

export function renderTextLink(link: Link | undefined): string {
  if (!link) {
    return "";
  }

  return `<a href="${escapeAttribute(link.href)}" class="at-link at-reveal">${renderText(link.label)}${arrow}</a>`;
}

const iconShapes: Record<string, string> = {
  plan: '<path d="M6 6h36v36H6zM6 20h20M26 6v36M26 30h16"/>',
  compass: '<circle cx="24" cy="24" r="17"/><path d="M30 18l-4 12-8 0 4-12z"/>',
  home: '<path d="M6 24L24 8l18 16M12 20v22h24V20M20 42V30h8v12"/>',
  chair: '<path d="M14 6h20v18H14zM10 24h28v8H10zM14 32v10M34 32v10"/>',
  leaf: '<path d="M40 8C18 8 8 20 8 30c0 5 3 9 8 10 0-12 8-20 24-24"/><path d="M12 40C16 30 24 22 34 16"/>',
  layers: '<path d="M24 6L42 16 24 26 6 16z"/><path d="M6 24l18 10 18-10M6 32l18 10 18-10"/>',
  building: '<path d="M10 42V8h20v34M30 18h8v24M4 42h40M16 14h8M16 22h8M16 30h8"/>',
  ruler: '<path d="M6 34L34 6l8 8L14 42z"/><path d="M14 26l4 4M20 20l4 4M26 14l4 4"/>',
};

const iconOrder = Object.keys(iconShapes);

const iconAliases: Record<string, string> = {
  "building-2": "building",
  landmark: "building",
  factory: "building",
  hotel: "building",
  "pencil-ruler": "ruler",
  "drafting-compass": "compass",
  sofa: "chair",
  armchair: "chair",
  bed: "chair",
  house: "home",
  trees: "leaf",
  sprout: "leaf",
  "layout-grid": "layers",
  diamond: "plan",
  target: "compass",
};

function pickIcon(name: string | undefined, index: number): string {
  const key = name ? (iconAliases[name] ?? name) : "";

  return iconShapes[key] ?? iconShapes[iconOrder[index % iconOrder.length]];
}

export function renderIcon(name: string | undefined, index: number, classes = "at-icon"): string {
  return `<svg class="${classes}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true" focusable="false">${pickIcon(name, index)}</svg>`;
}

export function renderStars(rating: number, label: string): string {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  return `<span role="img" aria-label="${escapeAttribute(label)}" class="at-stars">${stars}</span>`;
}

export function renderStatNumber(value: string, classes: string): string {
  const count = /^\d+$/.test(value) ? ` data-count="${escapeAttribute(value)}"` : "";

  return `<div class="at-num ${classes}"${count}>${renderText(value)}</div>`;
}
