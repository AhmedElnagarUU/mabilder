import { budgetKeys, resolveFormLabels, startKeys } from "../../../blocks/contact-options";
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

function renderInput(name: string, type: string, label: string, fieldClass: string, required = false): string {
  const requiredAttribute = required ? " required" : "";

  return `<input name="${name}" type="${type}"${requiredAttribute} placeholder="${escapeAttribute(label)}" aria-label="${escapeAttribute(label)}" class="${fieldClass}" />`;
}

function renderSelect(name: string, label: string, options: [string, string][], fieldClass: string): string {
  const items = options
    .map(([value, text]) => `<option value="${escapeAttribute(value)}">${renderText(text)}</option>`)
    .join("");

  return `<select name="${name}" aria-label="${escapeAttribute(label)}" class="${fieldClass}"><option value="">${renderText(label)}</option>${items}</select>`;
}

function renderFormFields(form: ContactForm, context: BlockContext, fieldClass: string): string {
  const labels = resolveFormLabels(form, context.locale);
  const services = context.content.facts.services.map((service): [string, string] => [service, service]);
  const budgets = budgetKeys.map((key): [string, string] => [key, labels.budgetOptions[key]]);
  const starts = startKeys.map((key): [string, string] => [key, labels.startOptions[key]]);
  const selects = [
    services.length > 0
      ? renderSelect("service", labels.serviceLabel, services, fieldClass)
      : "",
    renderSelect("budget", labels.budgetLabel, budgets, fieldClass),
    renderSelect("startWhen", labels.startLabel, starts, fieldClass),
  ].filter(Boolean);

  return `
          <div class="grid sm:grid-cols-2 gap-4">
            ${renderInput("name", "text", form.namePlaceholder, fieldClass, true)}
            ${renderInput("phone", "tel", labels.phonePlaceholder, fieldClass, true)}
            ${renderInput("email", "email", form.emailPlaceholder, fieldClass)}
            ${renderInput("location", "text", labels.locationPlaceholder, fieldClass)}
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            ${selects.join("\n            ")}
          </div>
          <textarea name="message" rows="4" placeholder="${escapeAttribute(form.messagePlaceholder)}" aria-label="${escapeAttribute(form.messagePlaceholder)}" class="${fieldClass} resize-none"></textarea>
          <div class="form-trap" aria-hidden="true"><input name="website" type="text" tabindex="-1" autocomplete="off" /></div>
          <input type="hidden" name="locale" value="${escapeAttribute(context.locale)}" />
          <p class="text-xs opacity-60">${renderText(labels.privacyNote)}</p>`;
}

function renderForm(form: ContactForm, context: BlockContext, fieldClass: string): string {
  const labels = resolveFormLabels(form, context.locale);
  const action = context.runtime.endpoint ? ` action="${escapeAttribute(context.runtime.endpoint)}"` : "";

  return `
        <form data-form method="post"${action} class="space-y-5" data-sending-label="${escapeAttribute(labels.sendingLabel)}">${renderFormFields(form, context, fieldClass)}
          <button type="submit" class="inline-flex items-center justify-center gap-3 bg-brass text-charcoal text-[11px] uppercase tracking-[0.2em] font-semibold px-8 py-4 hover:bg-cream transition disabled:opacity-60"><span data-submit-label>${renderText(form.submitLabel)}</span> <i data-lucide="arrow-right" class="w-4 h-4 rtl:rotate-180"></i></button>
          <p data-form-message role="status" class="hidden text-sm text-brass border border-brass/40 bg-brass/10 px-4 py-3">${renderText(form.successMessage)}</p>
          <p data-form-error role="alert" class="hidden text-sm form-error border border-current px-4 py-3">${renderText(labels.errorMessage)}</p>
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
      <div class="reveal">${renderForm(props.form, context, style.field)}
      </div>
    </div>`;
}

function renderFormOnly(block: ThemeBlock<"contact">, context: BlockContext, style: ToneStyle): string {
  const { props } = block;

  return `
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-12">
        ${renderEyebrow(props.eyebrow)}
        ${renderTitle(props.title)}
        <p class="${style.body} mt-6 text-sm leading-relaxed reveal">${renderText(props.body)}</p>
      </div>
      <div class="bg-charcoal text-cream border border-white/10 p-8 md:p-10 reveal">${renderForm(props.form, context, "form-field")}
      </div>
    </div>`;
}

export function renderContact(block: ThemeBlock<"contact">, context: BlockContext): string {
  const style = getToneStyle(context.tone);
  const inner =
    block.design === "agenvo/contact-form-only"
      ? renderFormOnly(block, context, style)
      : renderSplit(block, context, style);

  return renderSection(block, `${style.section} ${sectionPadding} scroll-mt-16`, inner, "contact");
}
