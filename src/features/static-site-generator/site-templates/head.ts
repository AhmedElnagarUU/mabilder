import { escapeAttribute } from "../content/html";
import { baseTemplate } from "./registry";
import type { SiteTemplate, TemplateTokens } from "./types";

const variables = [
  ["--site-bg", "bg"],
  ["--site-ink", "ink"],
  ["--site-accent", "accent"],
  ["--site-font-display", "fontDisplay"],
  ["--site-font-body", "fontBody"],
  ["--site-radius", "radius"],
  ["--site-space", "space"],
] as const satisfies readonly (readonly [string, keyof TemplateTokens])[];

// Values are developer-written template data, never customer input. A value that could close the
// style element is rejected rather than escaped.
function safeValue(value: string): string {
  if (/[<>{};]/.test(value)) {
    throw new Error(`Template token "${value}" contains a forbidden character.`);
  }

  return value;
}

function renderTokenStyle(template: SiteTemplate): string {
  const changed = variables.filter(([, key]) => template.tokens[key] !== baseTemplate.tokens[key]);

  if (changed.length === 0) {
    return "";
  }

  const lines = changed.map(([name, key]) => `${name}: ${safeValue(template.tokens[key])};`);

  return `\n  <style>:root { ${lines.join(" ")} }</style>`;
}

function renderFontLinks(template: SiteTemplate): string {
  return template.tokens.fontStylesheets
    .filter((url) => !baseTemplate.tokens.fontStylesheets.includes(url))
    .map((url) => `\n  <link href="${escapeAttribute(url)}" rel="stylesheet" />`)
    .join("");
}

// The shell's site.css already holds the base template's tokens and fonts, so only what differs is
// written. Base template: empty string, the page stays byte-identical.
export function renderTemplateHead(template: SiteTemplate): string {
  return `${renderFontLinks(template)}${renderTokenStyle(template)}`;
}
