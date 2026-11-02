import type { Facts } from "../../blocks/facts";
import { escapeAttribute, renderText } from "../../content/html";
import { renderForms } from "../../themes/agenvo/blocks/contact";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading } from "./parts";

const lineIcons = {
  mail: '<path d="M2 4h12v8H2zM2 5l6 4 6-4"/>',
  phone: '<path d="M3 2h2.5l1.2 3-1.5 1a7.5 7.5 0 005.3 5.3l1-1.5 3 1.2V14a1 1 0 01-1 1A13 13 0 012 3a1 1 0 011-1z"/>',
  pin: '<path d="M8 14.5s5-4.5 5-8A5 5 0 003 6.5c0 3.5 5 8 5 8z"/><circle cx="8" cy="6.5" r="1.6"/>',
};

function renderLine(icon: keyof typeof lineIcons, text: string | undefined, href?: string): string {
  if (!text) {
    return "";
  }

  const value = href
    ? `<a href="${escapeAttribute(href)}" class="ar-underline">${renderText(text)}</a>`
    : renderText(text);
  const svg = `<svg class="ar-line-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true" focusable="false">${lineIcons[icon]}</svg>`;

  return `<p class="ar-detail">${svg}<span>${value}</span></p>`;
}

function renderDetails(facts: Facts): string {
  const lines = [
    renderLine("mail", facts.email, facts.email ? `mailto:${facts.email}` : undefined),
    renderLine("phone", facts.phone, facts.phone ? `tel:${facts.phone.replace(/\s+/g, "")}` : undefined),
    renderLine("pin", facts.address),
  ].filter(Boolean);

  return lines.length === 0 ? "" : `<div class="ar-contact-details ar-reveal">${lines.join("")}</div>`;
}

// Source layout: text and contact lines on one side, dark form on the other.
export function renderContact(block: ThemeBlock<"contact">, context: BlockContext): string {
  const { props } = block;

  const inner = `
    <div class="ar-contact">
      <div class="ar-contact-text">
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
        <p class="ar-body ar-reveal">${renderText(props.body)}</p>
        ${renderDetails(context.content.facts)}
      </div>
      <div class="ar-reveal ar-forms">${renderForms(block, context, "form-field")}
      </div>
    </div>`;

  return renderSection(block, "ar-sec", inner, "contact");
}
