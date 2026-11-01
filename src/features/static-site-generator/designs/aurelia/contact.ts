import type { Facts } from "../../blocks/facts";
import { escapeAttribute, renderText } from "../../content/html";
import { renderForms } from "../../themes/agenvo/blocks/contact";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading, renderRule, sectionClasses } from "./parts";

const lineIcons = {
  mail: '<path d="M3 6h18v12H3zM3 7l9 7 9-7"/>',
  phone: '<path d="M5 3h4l2 5-2.5 1.5a11 11 0 005 5L15 12l5 2v4a2 2 0 01-2 2A16 16 0 013 5a2 2 0 012-2z"/>',
  pin: '<path d="M12 21s7-6.5 7-12a7 7 0 00-14 0c0 5.5 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>',
};

function renderLine(icon: keyof typeof lineIcons, text: string | undefined, href?: string): string {
  if (!text) {
    return "";
  }

  const value = href ? `<a href="${escapeAttribute(href)}" class="au-underline">${renderText(text)}</a>` : renderText(text);
  const svg = `<svg class="au-line-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true" focusable="false">${lineIcons[icon]}</svg>`;

  return `<p class="au-detail">${svg}<span>${value}</span></p>`;
}

function renderDetails(facts: Facts): string {
  const lines = [
    renderLine("mail", facts.email, facts.email ? `mailto:${facts.email}` : undefined),
    renderLine("phone", facts.phone, facts.phone ? `tel:${facts.phone.replace(/\s+/g, "")}` : undefined),
    renderLine("pin", facts.address),
  ].filter(Boolean);

  return lines.length === 0 ? "" : `<div class="au-details au-reveal">${lines.join("")}</div>`;
}

export function renderContact(block: ThemeBlock<"contact">, context: BlockContext): string {
  const { props } = block;

  const inner = `
    <div class="au-wrap au-split">
      <div class="au-text">
        ${renderRule()}
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
        <p class="au-body au-reveal">${renderText(props.body)}</p>
        ${renderDetails(context.content.facts)}
      </div>
      <div class="au-forms au-reveal">${renderForms(block, context, "form-field")}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone, "au-contact"), inner, "contact");
}
