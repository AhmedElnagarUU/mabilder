import { budgetKeys, resolveFormLabels, startKeys } from "../../../blocks/contact-options";
import type { Facts } from "../../../blocks/facts";
import { escapeAttribute, renderText } from "../../../content/html";
import { projectInLocale, projectSlugs } from "../../../content/project-pages";
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
type FormKind = "quote" | "visit" | "review";

const formKinds: FormKind[] = ["quote", "visit", "review"];

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

function renderServiceSelect(context: BlockContext, label: string, fieldClass: string): string {
  const services = context.content.facts.services.map((service): [string, string] => [service, service]);

  return services.length > 0 ? renderSelect("service", label, services, fieldClass) : "";
}

// Remembers which project the visitor asked about: site.js fills the hidden field and the note.
function renderProjectFields(context: BlockContext, aboutLabel: string): string {
  const { projects } = context.content.facts;
  const slugs = projectSlugs(projects);
  const options = projects
    .map(
      (project, index) =>
        `<span data-project-slug="${escapeAttribute(slugs[index])}" data-project-title="${escapeAttribute(projectInLocale(project, context.locale).title)}"></span>`,
    )
    .join("");

  return `
          <input type="hidden" name="projectSlug" value="" />
          <p data-project-note data-about-label="${escapeAttribute(aboutLabel)}" class="hidden text-sm text-brass"></p>
          <div class="hidden" aria-hidden="true">${options}</div>`;
}

function renderQuoteFields(form: ContactForm, context: BlockContext, fieldClass: string): string {
  const labels = resolveFormLabels(form, context.locale);
  const budgets = budgetKeys.map((key): [string, string] => [key, labels.budgetOptions[key]]);
  const starts = startKeys.map((key): [string, string] => [key, labels.startOptions[key]]);
  const selects = [
    renderServiceSelect(context, labels.serviceLabel, fieldClass),
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
          <textarea name="message" rows="4" placeholder="${escapeAttribute(form.messagePlaceholder)}" aria-label="${escapeAttribute(form.messagePlaceholder)}" class="${fieldClass} resize-none"></textarea>`;
}

function renderVisitFields(form: ContactForm, context: BlockContext, fieldClass: string): string {
  const labels = resolveFormLabels(form, context.locale);
  const times: [string, string][] = [
    ["morning", labels.visitMorningLabel],
    ["evening", labels.visitEveningLabel],
  ];
  const service = renderServiceSelect(context, labels.serviceLabel, fieldClass);

  return `
          <div class="grid sm:grid-cols-2 gap-4">
            ${renderInput("name", "text", form.namePlaceholder, fieldClass, true)}
            ${renderInput("phone", "tel", labels.phonePlaceholder, fieldClass, true)}
            ${service}
            ${renderInput("location", "text", labels.locationPlaceholder, fieldClass)}
            <label class="block text-xs opacity-70">${renderText(labels.visitDayLabel)}<input name="preferredDay" type="date" required data-visit-day aria-label="${escapeAttribute(labels.visitDayLabel)}" class="${fieldClass} mt-1" /></label>
            ${renderSelect("preferredTime", labels.visitTimeLabel, times, fieldClass)}
          </div>
          <textarea name="message" rows="3" placeholder="${escapeAttribute(labels.visitNotePlaceholder)}" aria-label="${escapeAttribute(labels.visitNotePlaceholder)}" class="${fieldClass} resize-none"></textarea>`;
}

const maxRating = 5;

// Radios come in the order 5..1: site.css shows them reversed so "checked or after" lights the stars.
function renderStarRating(name: string, label: string): string {
  const stars = Array.from({ length: maxRating }, (_, index) => maxRating - index)
    .map(
      (value) =>
        `<input type="radio" name="${name}" id="${name}-${value}" value="${value}" required /><label for="${name}-${value}" title="${value} / ${maxRating}"><span aria-hidden="true">★</span><span class="sr-only">${value} / ${maxRating}</span></label>`,
    )
    .join("");

  return `<fieldset class="space-y-2"><legend class="text-xs opacity-70">${renderText(label)}</legend><div class="star-rating">${stars}</div></fieldset>`;
}

function renderReviewProjectSelect(context: BlockContext, label: string, fieldClass: string): string {
  const { projects } = context.content.facts;
  const slugs = projectSlugs(projects);
  const options: [string, string][] = projects.map((project, index) => [
    slugs[index],
    projectInLocale(project, context.locale).title,
  ]);

  return options.length > 0 ? renderSelect("projectSlug", label, options, fieldClass) : "";
}

function renderReviewFields(form: ContactForm, context: BlockContext, fieldClass: string): string {
  const labels = resolveFormLabels(form, context.locale);

  return `
          <div class="grid sm:grid-cols-2 gap-4">
            ${renderInput("name", "text", form.namePlaceholder, fieldClass, true)}
            ${renderReviewProjectSelect(context, labels.reviewProjectLabel, fieldClass)}
          </div>
          ${renderStarRating("rating", labels.reviewRatingLabel)}
          <textarea name="comment" rows="4" required maxlength="600" placeholder="${escapeAttribute(labels.reviewCommentPlaceholder)}" aria-label="${escapeAttribute(labels.reviewCommentPlaceholder)}" class="${fieldClass} resize-none"></textarea>`;
}

function renderFormFields(kind: FormKind, form: ContactForm, context: BlockContext, fieldClass: string): string {
  if (kind === "visit") {
    return renderVisitFields(form, context, fieldClass);
  }

  return kind === "review"
    ? renderReviewFields(form, context, fieldClass)
    : renderQuoteFields(form, context, fieldClass);
}

function formTexts(kind: FormKind, form: ContactForm, labels: ReturnType<typeof resolveFormLabels>) {
  if (kind === "visit") {
    return { heading: labels.visitTabLabel, submit: labels.visitSubmitLabel, success: labels.visitSuccessMessage };
  }

  if (kind === "review") {
    return { heading: labels.reviewTabLabel, submit: labels.reviewSubmitLabel, success: labels.reviewSuccessMessage };
  }

  return { heading: labels.quoteTabLabel, submit: form.submitLabel, success: form.successMessage };
}

function renderForm(kind: FormKind, form: ContactForm, context: BlockContext, fieldClass: string): string {
  const labels = resolveFormLabels(form, context.locale);
  const action = context.runtime.endpoint ? ` action="${escapeAttribute(context.runtime.endpoint)}"` : "";
  const fields = renderFormFields(kind, form, context, fieldClass);
  const { heading, submit, success } = formTexts(kind, form, labels);
  const projectFields = kind === "review" ? "" : renderProjectFields(context, labels.aboutLabel);

  return `
        <h3 data-panel-title class="font-display text-2xl mb-5">${renderText(heading)}</h3>
        <form data-form method="post"${action} class="space-y-5" data-sending-label="${escapeAttribute(labels.sendingLabel)}">${fields}
          <div class="form-trap" aria-hidden="true"><input name="website" type="text" tabindex="-1" autocomplete="off" /></div>
          <input type="hidden" name="locale" value="${escapeAttribute(context.locale)}" />
          <input type="hidden" name="kind" value="${kind}" />${projectFields}
          <p class="text-xs opacity-60">${renderText(labels.privacyNote)}</p>
          <button type="submit" class="inline-flex items-center justify-center gap-3 bg-brass text-charcoal text-[11px] uppercase tracking-[0.2em] font-semibold px-8 py-4 hover:bg-cream transition disabled:opacity-60"><span data-submit-label>${renderText(submit)}</span> <i data-lucide="arrow-right" class="w-4 h-4 rtl:rotate-180"></i></button>
          <p data-form-message role="status" class="hidden text-sm text-brass border border-brass/40 bg-brass/10 px-4 py-3">${renderText(success)}</p>
          <p data-form-error role="alert" class="hidden text-sm form-error border border-current px-4 py-3">${renderText(labels.errorMessage)}</p>
        </form>`;
}

// Without JavaScript all forms are stacked; site.js shows the tab list and hides the inactive form.
export function renderForms(block: ThemeBlock<"contact">, context: BlockContext, fieldClass: string): string {
  const { form } = block.props;
  const labels = resolveFormLabels(form, context.locale);
  const tabLabels: Record<FormKind, string> = {
    quote: labels.quoteTabLabel,
    visit: labels.visitTabLabel,
    review: labels.reviewTabLabel,
  };
  const tabs = formKinds
    .map((kind, index) => {
      const selected = index === 0;

      return `<button type="button" role="tab" id="${escapeAttribute(`${block.id}-tab-${kind}`)}" aria-controls="${escapeAttribute(`${block.id}-panel-${kind}`)}" aria-selected="${selected}" tabindex="${selected ? 0 : -1}" data-tab="${kind}" class="form-tab">${renderText(tabLabels[kind])}</button>`;
    })
    .join("");
  const panels = formKinds
    .map(
      (kind) => `
      <div role="tabpanel" id="${escapeAttribute(`${block.id}-panel-${kind}`)}" aria-labelledby="${escapeAttribute(`${block.id}-tab-${kind}`)}" data-panel="${kind}" class="space-y-5">${renderForm(kind, form, context, fieldClass)}
      </div>`,
    )
    .join("");

  return `
      <div data-contact-tabs class="space-y-10">
        <div role="tablist" aria-label="${escapeAttribute(labels.tabsLabel)}" data-tablist class="hidden gap-2 border-b border-current/20">${tabs}</div>${panels}
      </div>`;
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
      <div class="reveal">${renderForms(block, context, style.field)}
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
      <div class="bg-charcoal text-cream border border-white/10 p-8 md:p-10 reveal">${renderForms(block, context, "form-field")}
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
