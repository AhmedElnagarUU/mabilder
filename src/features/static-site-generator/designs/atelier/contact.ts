import type { Facts } from "../../blocks/facts";
import { escapeAttribute, renderText } from "../../content/html";
import { renderForms } from "../../themes/agenvo/blocks/contact";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading, sectionClasses } from "./parts";

function renderLine(text: string | undefined, href?: string): string {
  if (!text) {
    return "";
  }

  const value = href ? `<a href="${escapeAttribute(href)}" class="at-underline">${renderText(text)}</a>` : renderText(text);

  return `<p class="at-detail">${value}</p>`;
}

function renderAddress(facts: Facts): string {
  const lines = [
    renderLine(facts.address),
    renderLine(facts.email, facts.email ? `mailto:${facts.email}` : undefined),
    renderLine(facts.phone, facts.phone ? `tel:${facts.phone.replace(/\s+/g, "")}` : undefined),
  ].filter(Boolean);

  return lines.length === 0 ? "" : `<aside class="at-address at-reveal">${lines.join("")}</aside>`;
}

// Three columns: the words, the forms, the address.
export function renderContact(block: ThemeBlock<"contact">, context: BlockContext): string {
  const { props } = block;

  const inner = `
    <div class="at-wrap at-contact-grid">
      <div class="at-text">
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
        <p class="at-body at-reveal">${renderText(props.body)}</p>
      </div>
      <div class="at-forms at-reveal">${renderForms(block, context, "form-field")}
      </div>
      ${renderAddress(context.content.facts)}
    </div>`;

  return renderSection(block, sectionClasses(context.tone, "at-contact"), inner, "contact");
}
