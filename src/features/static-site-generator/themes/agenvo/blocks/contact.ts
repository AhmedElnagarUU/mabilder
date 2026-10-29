import type { Facts } from "../../../blocks/facts";
import { escapeAttribute, renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import {
  getToneStyle,
  renderEyebrow,
  renderSection,
  renderTitle,
  sectionPadding,
  type ToneStyle,
} from "../parts";

type ContactForm = ThemeBlock<"contact">["props"]["form"];

function renderForm(form: ContactForm, fieldClass: string): string {
  return `
        <form data-form class="space-y-5">
          <div class="grid sm:grid-cols-2 gap-4">
            <input name="name" type="text" required placeholder="${escapeAttribute(form.namePlaceholder)}" aria-label="${escapeAttribute(form.namePlaceholder)}" class="${fieldClass}" />
            <input name="email" type="email" required placeholder="${escapeAttribute(form.emailPlaceholder)}" aria-label="${escapeAttribute(form.emailPlaceholder)}" class="${fieldClass}" />
          </div>
          <textarea name="message" rows="5" required placeholder="${escapeAttribute(form.messagePlaceholder)}" aria-label="${escapeAttribute(form.messagePlaceholder)}" class="${fieldClass} resize-none"></textarea>
          <button type="submit" class="inline-flex items-center justify-center gap-3 bg-brass text-charcoal text-[11px] uppercase tracking-[0.2em] font-semibold px-8 py-4 hover:bg-cream transition">${renderText(form.submitLabel)} <i data-lucide="arrow-right" class="w-4 h-4 rtl:rotate-180"></i></button>
          <p data-form-message class="hidden text-sm text-brass border border-brass/40 bg-brass/10 px-4 py-3">${renderText(form.successMessage)}</p>
        </form>`;
}

function renderContactLine(icon: string, text: string | undefined, href?: string): string {
  if (!text) {
    return "";
  }

  const value = href
    ? `<a href="${escapeAttribute(href)}" class="link-underline">${renderText(text)}</a>`
    : renderText(text);

  return `<p class="flex items-center gap-2"><i data-lucide="${icon}" class="w-4 h-4 text-brass shrink-0"></i> ${value}</p>`;
}

function renderContactDetails(facts: Facts, style: ToneStyle): string {
  const lines = [
    renderContactLine("mail", facts.email, facts.email ? `mailto:${facts.email}` : undefined),
    renderContactLine("phone", facts.phone, facts.phone ? `tel:${facts.phone.replace(/\s+/g, "")}` : undefined),
    renderContactLine("map-pin", facts.address),
  ].filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  return `
        <div class="mt-10 space-y-3 text-sm ${style.body}">
          ${lines.join("\n          ")}
        </div>`;
}

function renderSplit(block: ThemeBlock<"contact">, context: BlockContext, style: ToneStyle): string {
  const { props } = block;

  return `
    <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
      <div>
        <div class="h-px bg-brass line-draw mb-6" data-line></div>
        ${renderEyebrow(props.eyebrow)}
        ${renderTitle(props.title)}
        <p class="${style.body} mt-6 text-sm leading-relaxed reveal">${renderText(props.body)}</p>${renderContactDetails(context.content.facts, style)}
      </div>
      <div class="reveal">${renderForm(props.form, style.field)}
      </div>
    </div>`;
}

function renderFormOnly(block: ThemeBlock<"contact">, style: ToneStyle): string {
  const { props } = block;

  return `
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-12">
        ${renderEyebrow(props.eyebrow)}
        ${renderTitle(props.title)}
        <p class="${style.body} mt-6 text-sm leading-relaxed reveal">${renderText(props.body)}</p>
      </div>
      <div class="bg-charcoal text-cream border border-white/10 p-8 md:p-10 reveal">${renderForm(props.form, "form-field")}
      </div>
    </div>`;
}

export function renderContact(block: ThemeBlock<"contact">, context: BlockContext): string {
  const style = getToneStyle(context.tone);
  const inner =
    block.variant === "form-only"
      ? renderFormOnly(block, style)
      : renderSplit(block, context, style);

  return renderSection(block, `${style.section} ${sectionPadding} scroll-mt-16`, inner, "contact");
}
