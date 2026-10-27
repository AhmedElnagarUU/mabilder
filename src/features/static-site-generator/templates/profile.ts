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

export function renderProfilePage(content: SiteContent): string {
  const page = content.pages.profile;

  const body = `
${renderNav(content, "profile.html", "solid")}

  <section data-section="pages.profile.hero" class="relative min-h-[76vh] flex items-end bg-charcoal">
    <img src="${escapeAttribute(page.hero.image.src)}" alt="${renderAttribute(page.hero.image.alt)}" class="absolute inset-0 w-full h-full object-cover opacity-50" />
    <div class="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-charcoal/25"></div>
    <div class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pb-16 lg:pb-20">
      <p class="text-white/50 text-[11px] uppercase tracking-[0.3em] mb-5 reveal">${renderText(page.hero.eyebrow)}</p>
      <h1 class="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95] max-w-4xl reveal">${renderText(page.hero.title)}</h1>
      <p class="text-white/55 mt-7 max-w-xl text-sm leading-relaxed reveal">${renderText(page.hero.body)}</p>
    </div>
  </section>

  <section data-section="pages.profile.facts" class="bg-charcoal text-cream border-t border-white/10 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
      ${page.facts
        .map(
          (fact) =>
            `<div class="py-8 px-4 md:px-8 reveal"><p class="font-display text-3xl">${renderText(fact.value)}</p><p class="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">${renderText(fact.label)}</p></div>`,
        )
        .join("\n      ")}
    </div>
  </section>

  <section data-section="pages.profile.partners" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-12 gap-10 mb-14">
        <div class="lg:col-span-6">
          <div class="h-px bg-brass line-draw mb-6" data-line></div>
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.partners.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.partners.title)}</h2>
        </div>
        <div class="lg:col-span-6 lg:pt-10">
          <p class="text-sm text-gray-600 leading-relaxed reveal">${renderText(page.partners.body)}</p>
        </div>
      </div>

      <div class="grid md:grid-cols-2 gap-x-8 gap-y-14">
        ${page.partners.items
          .map(
            (person) => `
        <article class="reveal">
          <div class="grid sm:grid-cols-5 gap-6">
            <div class="sm:col-span-2 portrait overflow-hidden aspect-[4/5] bg-charcoal/5">
              <img src="${escapeAttribute(person.image.src)}" alt="${renderAttribute(person.image.alt)}" class="w-full h-full object-cover" />
            </div>
            <div class="sm:col-span-3 flex flex-col">
              ${person.seniority ? `<p class="text-[10px] uppercase tracking-[0.2em] text-brass">${renderText(person.seniority)}</p>` : ""}
              <h3 class="font-display text-3xl mt-1">${renderText(person.name)}</h3>
              <p class="text-sm text-gray-500 mt-1">${renderText(person.role)}</p>
              <p class="text-sm text-gray-600 leading-relaxed mt-4">${renderText(person.bio)}</p>
              <div class="mt-auto pt-5 flex flex-wrap gap-2">
                ${person.tags
                  .map(
                    (tag) =>
                      `<span class="text-[10px] uppercase tracking-[0.15em] border border-charcoal/15 px-2.5 py-1">${renderText(tag)}</span>`,
                  )
                  .join("\n                ")}
              </div>
              ${person.email ? `<a href="mailto:${escapeAttribute(person.email)}" class="inline-flex items-center gap-2 mt-5 text-[11px] uppercase tracking-[0.18em] text-brass link-underline">${renderText(person.email)} <i data-lucide="arrow-up-right" class="w-3 h-3"></i></a>` : ""}
            </div>
          </div>
        </article>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.profile.associates" class="bg-sand/60 py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.associates.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl reveal">${renderText(page.associates.title)}</h2>
        </div>
        <p class="text-sm text-gray-600 max-w-sm leading-relaxed reveal">${renderText(page.associates.body)}</p>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        ${page.associates.items
          .map(
            (person) => `
        <article class="reveal">
          <div class="portrait overflow-hidden aspect-[4/5] bg-charcoal/5">
            <img src="${escapeAttribute(person.image.src)}" alt="${renderAttribute(person.image.alt)}" class="w-full h-full object-cover" />
          </div>
          <h3 class="font-display text-2xl mt-4">${renderText(person.name)}</h3>
          <p class="text-[10px] uppercase tracking-[0.18em] text-brass mt-1">${renderText(person.role)}</p>
          <p class="text-sm text-gray-600 leading-relaxed mt-2">${renderText(person.bio)}</p>
        </article>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.profile.departments" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-12 gap-10 mb-14">
        <div class="lg:col-span-5">
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.departments.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.departments.title)}</h2>
        </div>
        <div class="lg:col-span-7">
          <p class="text-sm text-gray-600 leading-relaxed reveal">${renderText(page.departments.body)}</p>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-x-12 gap-y-10">
        ${page.departments.items
          .map(
            (item) => `
        <div class="border-t border-charcoal/15 pt-6 reveal">
          <div class="flex items-baseline justify-between gap-4">
            <h3 class="font-display text-2xl">${renderText(item.title)}</h3>
            ${item.meta ? `<span class="text-[11px] text-brass tracking-widest">${renderText(item.meta)}</span>` : ""}
          </div>
          <p class="text-sm text-gray-600 leading-relaxed mt-3">${renderText(item.body)}</p>
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.profile.culture" class="bg-charcoal text-cream py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16">
      <div class="lg:col-span-5">
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.culture.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.culture.title)}</h2>
        <p class="text-sm text-white/50 leading-relaxed mt-6 reveal">${renderText(page.culture.body)}</p>
        <div class="mt-8 img-zoom overflow-hidden reveal">
          <img src="${escapeAttribute(page.culture.image.src)}" alt="${renderAttribute(page.culture.image.alt)}" class="w-full h-64 object-cover" />
        </div>
      </div>
      <div class="lg:col-span-7 grid sm:grid-cols-2 gap-x-8 gap-y-10 lg:pt-10">
        ${page.culture.items
          .map(
            (item) => `
        <div class="reveal">
          <i data-lucide="${escapeAttribute(item.icon ?? "clock")}" class="w-5 h-5 text-brass mb-3"></i>
          <h3 class="font-display text-2xl mb-2">${renderText(item.title)}</h3>
          <p class="text-sm text-white/50 leading-relaxed">${renderText(item.body)}</p>
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  ${page.careers.items.length > 0 ? `<section data-section="pages.profile.careers" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-12 gap-10 mb-12">
        <div class="lg:col-span-5">
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.careers.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.careers.title)}</h2>
          <p class="text-sm text-gray-600 leading-relaxed mt-6 reveal">${renderText(page.careers.body)}</p>
          <a href="mailto:${escapeAttribute(page.careers.email)}" class="inline-flex items-center gap-2 mt-6 text-[11px] uppercase tracking-[0.2em] text-brass link-underline reveal">${renderText(page.careers.email)} <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a>
        </div>
        <div class="lg:col-span-7 divide-y divide-charcoal/10 border-t border-charcoal/10">
          ${page.careers.items
            .map(
              (job) => `
          <div class="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 reveal">
            <div>
              <h3 class="font-medium">${renderText(job.title)}</h3>
              <p class="text-sm text-gray-500 mt-1">${renderText(job.meta)}</p>
            </div>
            <a href="${escapeAttribute(job.href)}" class="text-[10px] uppercase tracking-[0.18em] border border-charcoal/20 px-4 py-2 hover:border-brass hover:text-brass transition whitespace-nowrap">${renderText(job.label)}</a>
          </div>`,
            )
            .join("")}
        </div>
      </div>
    </div>
  </section>` : ""}

  <section data-section="pages.profile.press" class="bg-sand/60 py-24 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-3 gap-12">
        ${page.press
          .map(
            (column) => `
        <div>
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(column.eyebrow)}</p>
          <h2 class="font-display text-3xl leading-tight reveal">${renderText(column.title)}</h2>
          <ul class="mt-6 space-y-4 text-sm text-gray-600 reveal">
            ${column.items
              .map(
                (item) =>
                  `<li>${item.href ? `<a href="${escapeAttribute(item.href)}" class="hover:text-brass transition">${renderText(item.label)}</a>` : renderText(item.label)}</li>`,
              )
              .join("\n            ")}
          </ul>
          ${
            column.link
              ? `<a href="${escapeAttribute(column.link.href)}" class="inline-flex items-center gap-2 mt-6 text-[11px] uppercase tracking-[0.2em] text-brass link-underline reveal">${renderText(column.link.label)} <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a>`
              : ""
          }
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

${renderCta(page.cta, "dark", "pages.profile.cta")}

${renderFooter(content, "full")}
`;

  return renderDocument(page.meta.title, page.meta.description, body);
}
