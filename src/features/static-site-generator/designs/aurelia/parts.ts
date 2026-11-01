import type { Link } from "../../blocks/common";
import { escapeAttribute, renderText } from "../../content/html";
import type { Tone } from "../../themes/types";

const arrow =
  '<svg class="au-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true" focusable="false"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';

// Section tones alternate the base charcoal and the deeper band.
export function sectionClasses(tone: Tone, extra = ""): string {
  const band = tone === "light" ? " au-band" : "";
  return `au-sec${band}${extra ? ` ${extra}` : ""}`;
}

export function renderRule(): string {
  return '<span class="au-rule au-reveal" aria-hidden="true"></span>';
}

export function renderEyebrow(text: string | undefined): string {
  return text ? `<p class="au-eyebrow au-reveal">${renderText(text)}</p>` : "";
}

export function renderHeading(text: string): string {
  return `<h2 class="au-title au-reveal">${renderText(text)}</h2>`;
}

export function renderOptionalBody(text: string | undefined, classes = ""): string {
  return text ? `<p class="au-body au-reveal ${classes}">${renderText(text)}</p>` : "";
}

export function renderParagraphs(paragraphs: string[]): string {
  return paragraphs.map((paragraph) => `<p class="au-body au-reveal">${renderText(paragraph)}</p>`).join("");
}

// Centered block header: eyebrow, title, optional body.
export function renderCenteredHead(
  eyebrow: string | undefined,
  title: string,
  body: string | undefined,
): string {
  return `
      <header class="au-head">
        ${renderEyebrow(eyebrow)}
        ${renderHeading(title)}
        ${renderOptionalBody(body)}
      </header>`;
}

// A title that already has *accent* marks keeps them; otherwise the last word goes on its own italic line.
export function renderAccentTitle(title: string): string {
  if (title.includes("*")) {
    return renderText(title);
  }

  const lines = title.split("\n");

  if (lines.length > 1) {
    return `${lines.slice(0, -1).map(renderText).join("<br />")}<br /><em>${renderText(lines[lines.length - 1])}</em>`;
  }

  const words = title.trim().split(/\s+/);

  if (words.length < 3) {
    return renderText(title);
  }

  return `${renderText(words.slice(0, -1).join(" "))}<br /><em>${renderText(words[words.length - 1])}</em>`;
}

export function renderButton(link: Link, kind: "outline" | "solid" = "outline"): string {
  return `<a href="${escapeAttribute(link.href)}" class="au-btn au-btn-${kind}">${renderText(link.label)}${arrow}</a>`;
}

export function renderTextLink(link: Link | undefined): string {
  if (!link) {
    return "";
  }

  return `<a href="${escapeAttribute(link.href)}" class="au-link au-reveal">${renderText(link.label)}${arrow}</a>`;
}

// Decorative edge between sections. Its color is the neighbour section's, found from the tone rhythm.
export function renderWave(edge: "top" | "bottom", tone: Tone): string {
  const neighbour = tone === "dark" ? "au-fill-band" : "au-fill-base";

  return `<svg class="au-wave au-wave-${edge} ${neighbour}" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 60V34C240 6 480 6 720 30s480 28 720 4V60z"/></svg>`;
}

const iconShapes: Record<string, string> = {
  diamond: '<path d="M24 4L44 24 24 44 4 24z"/><path d="M24 12L36 24 24 36 12 24z"/>',
  target: '<circle cx="24" cy="24" r="18"/><circle cx="24" cy="24" r="8"/><path d="M24 6v10"/>',
  star: '<path d="M24 8l4 12h12l-10 8 4 12-10-8-10 8 4-12-10-8h12z"/>',
  building: '<path d="M10 42V8h20v34M30 18h8v24M4 42h40M16 14h8M16 22h8M16 30h8"/>',
  ruler: '<path d="M6 34L34 6l8 8L14 42z"/><path d="M14 26l4 4M20 20l4 4M26 14l4 4"/>',
  home: '<path d="M6 24L24 8l18 16M12 20v22h24V20M20 42V30h8v12"/>',
  leaf: '<path d="M40 8C18 8 8 20 8 30c0 5 3 9 8 10 0-12 8-20 24-24"/><path d="M12 40C16 30 24 22 34 16"/>',
  layers: '<path d="M24 6L42 16 24 26 6 16z"/><path d="M6 24l18 10 18-10M6 32l18 10 18-10"/>',
  key: '<circle cx="16" cy="32" r="9"/><path d="M22 26L40 8M32 16l6 6M36 12l4 4"/>',
};

const iconOrder = Object.keys(iconShapes);

const iconAliases: Record<string, string> = {
  "building-2": "building",
  landmark: "building",
  factory: "building",
  hotel: "building",
  "pencil-ruler": "ruler",
  compass: "ruler",
  "drafting-compass": "ruler",
  sofa: "home",
  armchair: "home",
  house: "home",
  bed: "home",
  trees: "leaf",
  sprout: "leaf",
  "layout-grid": "layers",
};

function pickIcon(name: string | undefined, index: number): string {
  const key = name ? (iconAliases[name] ?? name) : "";

  return iconShapes[key] ?? iconShapes[iconOrder[index % iconOrder.length]];
}

// Line icons are inline SVG. A name we do not draw falls back to a shape chosen by position.
export function renderIcon(name: string | undefined, index: number, classes = "au-icon"): string {
  return `<svg class="${classes}" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true" focusable="false">${pickIcon(name, index)}</svg>`;
}

export function renderStars(rating: number, label: string): string {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  return `<span role="img" aria-label="${escapeAttribute(label)}" class="au-stars">${stars}</span>`;
}

export function renderStatNumber(value: string, classes: string): string {
  const count = /^\d+$/.test(value) ? ` data-count="${escapeAttribute(value)}"` : "";

  return `<div class="au-num ${classes}"${count}>${renderText(value)}</div>`;
}
