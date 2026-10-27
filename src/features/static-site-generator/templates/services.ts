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

export function renderServicesPage(content: SiteContent): string {
  const page = content.pages.services;
  const architectureImages = page.architecture.images;

  const body = `
${renderNav(content, "services.html", "solid")}

  <section data-section="pages.services.hero" class="relative min-h-[78vh] flex items-end bg-charcoal">
    <img src="${escapeAttribute(page.hero.image.src)}" alt="${renderAttribute(page.hero.image.alt)}" class="absolute inset-0 w-full h-full object-cover opacity-50" />
    <div class="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/55 to-charcoal/25"></div>
    <div class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pb-16 lg:pb-20">
      <p class="text-white/50 text-[11px] uppercase tracking-[0.3em] mb-5 reveal">${renderText(page.hero.eyebrow)}</p>
      <h1 class="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95] max-w-4xl reveal">${renderText(page.hero.title)}</h1>
      <p class="text-white/55 mt-7 max-w-xl text-sm leading-relaxed reveal">${renderText(page.hero.body)}</p>
    </div>
  </section>

  <section data-section="pages.services.index" class="border-b border-charcoal/10 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-charcoal/10">
      ${page.index
        .map(
          (item) => `
      <a href="${escapeAttribute(item.href)}" class="py-6 md:py-8 px-4 md:px-6 group">
        <span class="text-[10px] uppercase tracking-[0.2em] text-brass">${renderText(item.number)}</span>
        <p class="font-display text-xl mt-1 group-hover:text-brass transition">${renderText(item.title)}</p>
      </a>`,
        )
        .join("")}
    </div>
  </section>

  <section data-section="pages.services.architecture" id="architecture" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16 scroll-mt-20">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16">
      <div class="lg:col-span-5">
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.architecture.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.architecture.title)}</h2>
        ${page.architecture.paragraphs
          .map(
            (paragraph) =>
              `<p class="text-gray-600 text-sm leading-relaxed mt-6 reveal">${renderText(paragraph)}</p>`,
          )
          .join("\n        ")}
        <div class="mt-8 grid grid-cols-2 gap-6 border-t border-charcoal/10 pt-6">
          ${page.architecture.stats
            .map(
              (stat) => `
          <div class="reveal">
            <p class="font-display text-3xl">${renderText(stat.value)}</p>
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-1">${renderText(stat.label)}</p>
          </div>`,
            )
            .join("")}
        </div>
        <ul class="mt-8 space-y-3 text-sm text-gray-600 reveal">
          ${page.architecture.points
            .map(
              (point) =>
                `<li class="flex gap-3"><i data-lucide="check" class="w-4 h-4 text-brass shrink-0 mt-0.5"></i> ${renderText(point)}</li>`,
            )
            .join("\n          ")}
        </ul>
      </div>
      <div class="lg:col-span-7 grid gap-4">
        <div class="img-zoom overflow-hidden reveal">
          <img src="${escapeAttribute(architectureImages[0].src)}" alt="${renderAttribute(architectureImages[0].alt)}" class="w-full h-80 md:h-[420px] object-cover" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          ${architectureImages
            .slice(1, 3)
            .map(
              (image) => `
          <div class="img-zoom overflow-hidden reveal">
            <img src="${escapeAttribute(image.src)}" alt="${renderAttribute(image.alt)}" class="w-full h-48 md:h-56 object-cover" />
          </div>`,
            )
            .join("")}
        </div>
      </div>
    </div>
  </section>

  <section data-section="pages.services.engineering" id="engineering" class="bg-charcoal text-cream py-24 lg:py-32 px-6 md:px-10 lg:px-16 scroll-mt-20">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16">
      <div class="lg:col-span-7 order-2 lg:order-1 grid gap-4">
        <div class="img-zoom overflow-hidden reveal">
          <img src="${escapeAttribute(page.engineering.image.src)}" alt="${renderAttribute(page.engineering.image.alt)}" class="w-full h-80 md:h-[400px] object-cover" />
        </div>
        <div class="grid md:grid-cols-3 gap-4">
          ${page.engineering.stats
            .map(
              (stat) => `
          <div class="border border-white/10 p-5 reveal">
            <p class="font-display text-3xl text-brass">${renderText(stat.value)}</p>
            <p class="text-[10px] uppercase tracking-[0.15em] text-white/40 mt-2">${renderText(stat.label)}</p>
          </div>`,
            )
            .join("")}
        </div>
      </div>
      <div class="lg:col-span-5 order-1 lg:order-2">
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.engineering.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.engineering.title)}</h2>
        ${page.engineering.paragraphs
          .map(
            (paragraph) =>
              `<p class="text-white/50 text-sm leading-relaxed mt-6 reveal">${renderText(paragraph)}</p>`,
          )
          .join("\n        ")}
        <ul class="mt-8 space-y-3 text-sm text-white/60 reveal">
          ${page.engineering.points
            .map(
              (point) =>
                `<li class="flex gap-3"><i data-lucide="check" class="w-4 h-4 text-brass shrink-0 mt-0.5"></i> ${renderText(point)}</li>`,
            )
            .join("\n          ")}
        </ul>
        <a href="${escapeAttribute(page.engineering.link.href)}" class="inline-flex items-center gap-2 mt-8 text-[11px] uppercase tracking-[0.2em] text-brass link-underline reveal">${renderText(page.engineering.link.label)} <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a>
      </div>
    </div>
  </section>

  <section data-section="pages.services.interiors" id="interiors" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16 scroll-mt-20">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-12 gap-10 items-end mb-14">
        <div class="lg:col-span-7">
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.interiors.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.interiors.title)}</h2>
        </div>
        <div class="lg:col-span-5">
          <p class="text-sm text-gray-600 leading-relaxed reveal">${renderText(page.interiors.body)}</p>
        </div>
      </div>
      <div class="grid md:grid-cols-3 gap-4">
        ${page.interiors.cards
          .map(
            (card) => `
        <div class="reveal">
          <div class="img-zoom overflow-hidden">
            <img src="${escapeAttribute(card.image.src)}" alt="${renderAttribute(card.image.alt)}" class="w-full h-72 object-cover" />
          </div>
          <h3 class="font-display text-2xl mt-5">${renderText(card.title)}</h3>
          <p class="text-sm text-gray-600 leading-relaxed mt-2">${renderText(card.body)}</p>
        </div>`,
          )
          .join("")}
      </div>
      <div class="mt-12 grid md:grid-cols-2 gap-10 border-t border-charcoal/10 pt-10">
        <div class="reveal">
          <h3 class="font-display text-2xl mb-3">${renderText(page.interiors.includesTitle)}</h3>
          <div class="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm text-gray-600">
            ${page.interiors.includes
              .map(
                (item) =>
                  `<p class="flex gap-2"><i data-lucide="minus" class="w-4 h-4 text-brass shrink-0 mt-0.5"></i> ${renderText(item)}</p>`,
              )
              .join("\n            ")}
          </div>
        </div>
        <div class="reveal">
          <h3 class="font-display text-2xl mb-3">${renderText(page.interiors.audienceTitle)}</h3>
          ${page.interiors.audience
            .map(
              (paragraph) =>
                `<p class="text-sm text-gray-600 leading-relaxed mt-4">${renderText(paragraph)}</p>`,
            )
            .join("\n          ")}
        </div>
      </div>
    </div>
  </section>

  <section data-section="pages.services.advisory" id="advisory" class="bg-sand/60 py-24 lg:py-32 px-6 md:px-10 lg:px-16 scroll-mt-20">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-12 gap-10 mb-14">
        <div class="lg:col-span-5">
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.advisory.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.advisory.title)}</h2>
        </div>
        <div class="lg:col-span-7">
          <p class="text-sm text-gray-600 leading-relaxed reveal">${renderText(page.advisory.body)}</p>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-x-12 gap-y-10">
        ${page.advisory.items
          .map(
            (item) => `
        <div class="border-t border-charcoal/15 pt-6 reveal">
          <div class="flex items-start justify-between gap-4">
            <h3 class="font-display text-2xl">${renderText(item.title)}</h3>
            <i data-lucide="${escapeAttribute(item.icon ?? "map")}" class="w-5 h-5 text-brass shrink-0"></i>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed mt-3">${renderText(item.body)}</p>
          ${item.meta ? `<p class="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-4">${renderText(item.meta)}</p>` : ""}
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.services.process" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.process.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl reveal">${renderText(page.process.title)}</h2>
        </div>
        <p class="text-sm text-gray-600 max-w-sm leading-relaxed reveal">${renderText(page.process.body)}</p>
      </div>
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        ${page.process.steps
          .map(
            (step) => `
        <div class="border-t border-charcoal/15 pt-6 reveal">
          <span class="font-display text-4xl text-brass/50">${renderText(step.number ?? "")}</span>
          <h3 class="font-medium mt-3">${renderText(step.title)}</h3>
          <p class="text-sm text-gray-600 leading-relaxed mt-2">${renderText(step.body)}</p>
          ${step.meta ? `<p class="text-[10px] uppercase tracking-[0.18em] text-gray-400 mt-4">${renderText(step.meta)}</p>` : ""}
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.services.fees" class="bg-charcoal text-cream py-24 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
      <div class="lg:col-span-4">
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.fees.eyebrow)}</p>
        <h2 class="font-display text-4xl leading-tight reveal">${renderText(page.fees.title)}</h2>
        <p class="text-sm text-white/45 leading-relaxed mt-6 reveal">${renderText(page.fees.body)}</p>
        <a href="${escapeAttribute(page.fees.link.href)}" class="inline-flex items-center gap-2 mt-8 text-[11px] uppercase tracking-[0.2em] text-brass link-underline reveal">${renderText(page.fees.link.label)} <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a>
      </div>
      <div class="lg:col-span-8 divide-y divide-white/10 border-t border-white/10">
        ${page.fees.items
          .map(
            (item) => `
        <div class="py-6 grid md:grid-cols-[180px_1fr] gap-4 reveal">
          <p class="text-[11px] uppercase tracking-[0.2em] text-brass">${renderText(item.title)}</p>
          <p class="text-sm text-white/55 leading-relaxed">${renderText(item.body)}</p>
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.services.faq" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
      <div class="lg:col-span-4">
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.faq.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.faq.title)}</h2>
        <p class="text-sm text-gray-600 leading-relaxed mt-6 reveal">${renderText(page.faq.body)}</p>
        <a href="${escapeAttribute(page.faq.link.href)}" class="inline-flex items-center gap-2 mt-6 text-[11px] uppercase tracking-[0.2em] text-brass link-underline reveal">${renderText(page.faq.link.label)} <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a>
      </div>
      <div class="lg:col-span-8 divide-y divide-charcoal/10 border-t border-charcoal/10">
        ${page.faq.items
          .map(
            (item) => `
        <details class="faq py-5 reveal">
          <summary class="flex items-center justify-between gap-6">
            <span class="font-display text-xl">${renderText(item.question)}</span>
            <i data-lucide="plus" class="faq-icon w-4 h-4 text-brass shrink-0"></i>
          </summary>
          <p class="text-sm text-gray-600 leading-relaxed mt-4 pr-10">${renderText(item.answer)}</p>
        </details>`,
          )
          .join("")}
      </div>
    </div>
  </section>

${renderCta(page.cta, "dark", "pages.services.cta")}

${renderFooter(content, "full")}
`;

  return renderDocument(page.meta.title, page.meta.description, body);
}
