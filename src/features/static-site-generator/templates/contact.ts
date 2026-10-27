import {
  escapeAttribute,
  renderAttribute,
  renderText,
} from "../content/html";
import type { SiteContent } from "../content/types";
import { renderCta } from "./cta";
import { renderDocument } from "./document";
import { renderFooter } from "./footer";
import { renderNav } from "./nav";

export function renderContactPage(content: SiteContent): string {
  const page = content.pages.contact;
  const form = page.enquiry.form;

  const body = `
${renderNav(content, "contact.html", "solid")}

  <section data-section="pages.contact.hero" class="relative min-h-[64vh] flex items-end bg-charcoal">
    <img src="${escapeAttribute(page.hero.image.src)}" alt="${renderAttribute(page.hero.image.alt)}" class="absolute inset-0 w-full h-full object-cover opacity-45" />
    <div class="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal/30"></div>
    <div class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pb-16 lg:pb-20">
      <p class="text-white/50 text-[11px] uppercase tracking-[0.3em] mb-5 reveal">${renderText(page.hero.eyebrow)}</p>
      <h1 class="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95] max-w-4xl reveal">${renderText(page.hero.title)}</h1>
      <p class="text-white/55 mt-7 max-w-xl text-sm leading-relaxed reveal">${renderText(page.hero.body)}</p>
    </div>
  </section>

  <section data-section="pages.contact.methods" class="border-b border-charcoal/10 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-charcoal/10">
      ${page.methods
        .map(
          (method) => `
      <a href="${escapeAttribute(method.href)}" class="py-8 md:py-10 md:px-8 first:md:pl-0 group">
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-brass mb-2">${renderText(method.eyebrow)}</p>
            <p class="font-display text-2xl group-hover:text-brass transition">${renderText(method.value)}</p>
            <p class="text-xs text-gray-500 mt-2">${renderText(method.body)}</p>
          </div>
          <i data-lucide="${escapeAttribute(method.icon)}" class="w-5 h-5 text-brass shrink-0 mt-1"></i>
        </div>
      </a>`,
        )
        .join("")}
    </div>
  </section>

  <section data-section="pages.contact.enquiry" id="enquiry" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16 scroll-mt-16">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16">
      <div class="lg:col-span-5">
        <div class="h-px bg-brass line-draw mb-6" data-line></div>
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.enquiry.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.enquiry.title)}</h2>
        <p class="text-sm text-gray-600 leading-relaxed mt-6 reveal">${renderText(page.enquiry.body)}</p>

        <div class="mt-10 space-y-6">
          ${page.enquiry.steps
            .map(
              (step) => `
          <div class="reveal">
            <p class="text-[10px] uppercase tracking-[0.2em] text-brass mb-1">${renderText(step.label)}</p>
            <p class="text-sm text-gray-600 leading-relaxed">${renderText(step.body)}</p>
          </div>`,
            )
            .join("")}
        </div>

        <div class="mt-10 border-t border-charcoal/10 pt-6 reveal">
          <p class="text-[10px] uppercase tracking-[0.2em] text-brass mb-2">${renderText(page.enquiry.emailLabel)}</p>
          <p class="text-sm text-gray-600 leading-relaxed">${renderText(page.enquiry.email)}</p>
        </div>
      </div>

      <div class="lg:col-span-7">
        <div class="bg-charcoal text-cream p-8 md:p-10 reveal">
          <h3 class="font-display text-2xl mb-1">${renderText(page.enquiry.cardTitle)}</h3>
          <p class="text-xs text-white/40 mb-8">${renderText(page.enquiry.requiredNote)}</p>

          <form data-form class="space-y-5">
            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label for="name" class="block text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">${renderText(form.nameLabel)}</label>
                <input id="name" name="name" type="text" required placeholder="${renderAttribute(form.namePlaceholder)}" class="form-field" />
              </div>
              <div>
                <label for="email" class="block text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">${renderText(form.emailLabel)}</label>
                <input id="email" name="email" type="email" required placeholder="${renderAttribute(form.emailPlaceholder)}" class="form-field" />
              </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label for="phone" class="block text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">${renderText(form.phoneLabel)}</label>
                <input id="phone" name="phone" type="tel" placeholder="${renderAttribute(form.phonePlaceholder)}" class="form-field" />
              </div>
              <div>
                <label for="company" class="block text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">${renderText(form.companyLabel)}</label>
                <input id="company" name="company" type="text" placeholder="${renderAttribute(form.companyPlaceholder)}" class="form-field" />
              </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label for="service" class="block text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">${renderText(form.serviceLabel)}</label>
                <select id="service" name="service" required class="form-field">
                  <option value="" disabled selected>${renderText(form.servicePlaceholder)}</option>
                  ${form.services
                    .map(
                      (option) =>
                        `<option>${renderText(option)}</option>`,
                    )
                    .join("\n                  ")}
                </select>
              </div>
              <div>
                <label for="budget" class="block text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">${renderText(form.budgetLabel)}</label>
                <select id="budget" name="budget" class="form-field">
                  <option value="" disabled selected>${renderText(form.budgetPlaceholder)}</option>
                  ${form.budgets
                    .map(
                      (option) =>
                        `<option>${renderText(option)}</option>`,
                    )
                    .join("\n                  ")}
                </select>
              </div>
            </div>

            <div class="grid sm:grid-cols-2 gap-4">
              <div>
                <label for="location" class="block text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">${renderText(form.locationLabel)}</label>
                <input id="location" name="location" type="text" placeholder="${renderAttribute(form.locationPlaceholder)}" class="form-field" />
              </div>
              <div>
                <label for="timeline" class="block text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">${renderText(form.timelineLabel)}</label>
                <select id="timeline" name="timeline" class="form-field">
                  <option value="" disabled selected>${renderText(form.timelinePlaceholder)}</option>
                  ${form.timelines
                    .map(
                      (option) =>
                        `<option>${renderText(option)}</option>`,
                    )
                    .join("\n                  ")}
                </select>
              </div>
            </div>

            <div>
              <label for="message" class="block text-[10px] uppercase tracking-[0.18em] text-white/45 mb-2">${renderText(form.messageLabel)}</label>
              <textarea id="message" name="message" rows="5" required placeholder="${renderAttribute(form.messagePlaceholder)}" class="form-field resize-none"></textarea>
            </div>

            <label class="flex items-start gap-3 text-xs text-white/40 leading-relaxed">
              <input type="checkbox" required class="mt-0.5 accent-[#B8956C]" />
              <span>${renderText(form.consent)}</span>
            </label>

            <div class="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
              <button type="submit" class="inline-flex items-center justify-center gap-3 bg-brass text-charcoal text-[11px] uppercase tracking-[0.2em] font-semibold px-8 py-4 hover:bg-cream transition">${renderText(form.submitLabel)} <i data-lucide="arrow-right" class="w-4 h-4"></i></button>
              <p class="text-[11px] text-white/35">${renderText(form.replyNote)}</p>
            </div>

            <p data-form-message class="hidden text-sm text-brass border border-brass/40 bg-brass/10 px-4 py-3">${renderText(form.successMessage)}</p>
          </form>
        </div>
      </div>
    </div>
  </section>

  <section data-section="pages.contact.offices" class="bg-sand/60 py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.offices.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl reveal">${renderText(page.offices.title)}</h2>
        </div>
        <p class="text-sm text-gray-600 max-w-sm leading-relaxed reveal">${renderText(page.offices.body)}</p>
      </div>

      <div class="grid lg:grid-cols-2 gap-10">
        ${page.offices.items
          .map(
            (office) => `
        <article class="reveal">
          <div class="img-zoom overflow-hidden">
            <img src="${escapeAttribute(office.image.src)}" alt="${renderAttribute(office.image.alt)}" class="w-full h-64 md:h-80 object-cover" />
          </div>
          <div class="bg-cream p-7 md:p-9 -mt-10 relative mx-4 md:mx-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[10px] uppercase tracking-[0.2em] text-brass mb-1">${renderText(office.tag)}</p>
                <h3 class="font-display text-3xl">${renderText(office.city)}</h3>
              </div>
              <span class="text-[10px] uppercase tracking-[0.18em] border border-charcoal/15 px-2.5 py-1">${renderText(office.timezone)}</span>
            </div>
            <p class="text-sm text-gray-600 leading-relaxed mt-4">${office.address.map((line) => `<span>${renderText(line)}</span>`).join("<br />")}</p>
            <div class="mt-4 text-sm text-gray-600 space-y-1">
              <p><a href="${escapeAttribute(office.phoneHref)}" class="link-underline">${renderText(office.phone)}</a></p>
              <p><a href="mailto:${escapeAttribute(office.email)}" class="link-underline">${renderText(office.email)}</a></p>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed mt-4">${renderText(office.directions)}</p>
            <a href="${escapeAttribute(office.mapHref)}" target="_blank" rel="noopener" class="inline-flex items-center gap-2 mt-5 text-[11px] uppercase tracking-[0.18em] text-brass link-underline">${renderText(office.mapLabel)} <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a>
          </div>
        </article>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.contact.departments" class="py-24 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-12 gap-10 mb-12">
        <div class="lg:col-span-5">
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.departments.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.departments.title)}</h2>
        </div>
        <div class="lg:col-span-7">
          <p class="text-sm text-gray-600 leading-relaxed reveal">${renderText(page.departments.body)}</p>
        </div>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8">
        ${page.departments.items
          .map(
            (item) => `
        <div class="border-t border-charcoal/15 pt-5 reveal">
          <p class="text-[10px] uppercase tracking-[0.18em] text-brass mb-1">${renderText(item.tag)}</p>
          <a href="mailto:${escapeAttribute(item.email)}" class="font-display text-2xl link-underline">${renderText(item.email)}</a>
          <p class="text-sm text-gray-600 leading-relaxed mt-2">${renderText(item.body)}</p>
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.contact.faq" class="bg-charcoal text-cream py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
      <div class="lg:col-span-4">
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.faq.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.faq.title)}</h2>
        <p class="text-sm text-white/45 leading-relaxed mt-6 reveal">${renderText(page.faq.body)}</p>
        <div class="mt-8 border border-white/10 p-6 reveal">
          <p class="text-[10px] uppercase tracking-[0.2em] text-brass mb-2">${renderText(page.faq.noteTitle)}</p>
          <p class="text-sm text-white/50 leading-relaxed">${renderText(page.faq.noteBody)}</p>
        </div>
      </div>
      <div class="lg:col-span-8 divide-y divide-white/10 border-t border-white/10">
        ${page.faq.items
          .map(
            (item) => `
        <details class="faq py-5 reveal">
          <summary class="flex items-center justify-between gap-6">
            <span class="font-display text-xl">${renderText(item.question)}</span>
            <i data-lucide="plus" class="faq-icon w-4 h-4 text-brass shrink-0"></i>
          </summary>
          <p class="text-sm text-white/50 leading-relaxed mt-4 pr-10">${renderText(item.answer)}</p>
        </details>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.contact.newsletter" class="py-24 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
      <div>
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.newsletter.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.newsletter.title)}</h2>
        <p class="text-sm text-gray-600 leading-relaxed mt-6 max-w-md reveal">${renderText(page.newsletter.body)}</p>
      </div>
      <form data-form class="reveal">
        <div class="flex flex-col sm:flex-row gap-3">
          <label for="newsletter-email" class="sr-only">${renderText(page.newsletter.label)}</label>
          <input id="newsletter-email" type="email" required placeholder="${renderAttribute(page.newsletter.placeholder)}" class="form-field light-field flex-1" />
          <button type="submit" class="bg-charcoal text-cream text-[11px] uppercase tracking-[0.2em] px-7 py-4 hover:bg-brass hover:text-charcoal transition whitespace-nowrap">${renderText(page.newsletter.buttonLabel)}</button>
        </div>
        <p data-form-message class="hidden mt-4 text-sm text-brass">${renderText(page.newsletter.successMessage)}</p>
        <p class="text-[11px] text-gray-500 mt-3">${renderText(page.newsletter.note)}</p>
      </form>
    </div>
  </section>

${renderCta(page.cta, "light", "pages.contact.cta")}

${renderFooter(content, "full")}
`;

  return renderDocument(page.meta.title, page.meta.description, body);
}
