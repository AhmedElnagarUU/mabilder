import {
  escapeAttribute,
  renderAttribute,
  renderText,
} from "../content/html";
import type { SiteContent, WorkPageContent } from "../content/types";
import { renderCta } from "./cta";
import { renderDocument } from "./document";
import { renderFooter } from "./footer";
import { renderNav } from "./nav";

type CaseStudy = WorkPageContent["caseStudies"][number];

function counterValue(value: string): string {
  return /^\d+$/.test(value) ? "0" : renderText(value);
}

function counterData(value: string): string {
  return /^\d+$/.test(value) ? ` data-count="${value}"` : "";
}

function renderCaseStudy(caseStudy: CaseStudy, sectionPath: string): string {
  if (caseStudy.variant === "dark") {
    return `
  <section data-section="${sectionPath}" id="${escapeAttribute(caseStudy.id)}" class="bg-charcoal text-cream py-24 lg:py-32 px-6 md:px-10 lg:px-16 scroll-mt-20">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-12 gap-10 items-end mb-14">
        <div class="lg:col-span-7">
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(caseStudy.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-6xl leading-[1.05] reveal">${renderText(caseStudy.title)}</h2>
        </div>
        <div class="lg:col-span-5">
          <p class="text-sm text-white/50 leading-relaxed reveal">${renderText(caseStudy.intro)}</p>
        </div>
      </div>
      <div class="grid md:grid-cols-2 gap-4 mb-14">
        ${caseStudy.images
          .map(
            (image) => `
        <div class="img-zoom overflow-hidden reveal">
          <img src="${escapeAttribute(image.src)}" alt="${renderAttribute(image.alt)}" class="w-full h-72 md:h-[420px] object-cover" />
        </div>`,
          )
          .join("")}
      </div>
      <div class="grid md:grid-cols-3 gap-10 border-t border-white/10 pt-10">
        ${caseStudy.blocks
          .map(
            (block) => `
        <div class="reveal">
          <p class="text-[10px] uppercase tracking-[0.2em] text-brass mb-3">${renderText(block.title)}</p>
          <p class="text-sm text-white/55 leading-relaxed">${renderText(block.body)}</p>
        </div>`,
          )
          .join("")}
      </div>
      <div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        ${caseStudy.stats
          .map(
            (stat) => `
        <div class="reveal"><p class="font-display text-3xl text-brass">${renderText(stat.value)}</p><p class="text-[10px] uppercase tracking-[0.18em] text-white/40 mt-1">${renderText(stat.label)}</p></div>`,
          )
          .join("")}
      </div>
    </div>
  </section>`;
  }

  if (caseStudy.variant === "split") {
    return `
  <section data-section="${sectionPath}" id="${escapeAttribute(caseStudy.id)}" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16 scroll-mt-20">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
      <div class="lg:col-span-5 lg:sticky lg:top-28 self-start">
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(caseStudy.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(caseStudy.title)}</h2>
        <p class="text-sm text-gray-600 leading-relaxed mt-6 reveal">${renderText(caseStudy.intro)}</p>
        <dl class="mt-8 divide-y divide-charcoal/10 border-t border-charcoal/10 text-sm">
          ${caseStudy.facts
            .map(
              (fact) =>
                `<div class="flex justify-between gap-4 py-3 reveal"><dt class="text-gray-500">${renderText(fact.label)}</dt><dd class="text-right">${renderText(fact.value)}</dd></div>`,
            )
            .join("\n          ")}
        </dl>
      </div>
      <div class="lg:col-span-7 grid gap-4">
        <div class="img-zoom overflow-hidden reveal">
          <img src="${escapeAttribute(caseStudy.images[0].src)}" alt="${renderAttribute(caseStudy.images[0].alt)}" class="w-full h-80 md:h-[440px] object-cover" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          ${caseStudy.images
            .slice(1, 3)
            .map(
              (image) => `
          <div class="img-zoom overflow-hidden reveal">
            <img src="${escapeAttribute(image.src)}" alt="${renderAttribute(image.alt)}" class="w-full h-48 md:h-60 object-cover" />
          </div>`,
            )
            .join("")}
        </div>
        <div class="reveal">
          ${caseStudy.body
            .map(
              (paragraph) =>
                `<p class="text-sm text-gray-600 leading-relaxed mt-4">${renderText(paragraph)}</p>`,
            )
            .join("\n          ")}
        </div>
      </div>
    </div>
  </section>`;
  }

  return `
  <section data-section="${sectionPath}" id="${escapeAttribute(caseStudy.id)}" class="bg-sand/60 py-24 lg:py-32 px-6 md:px-10 lg:px-16 scroll-mt-20">
    <div class="max-w-7xl mx-auto">
      <div class="grid lg:grid-cols-12 gap-10 items-end mb-12">
        <div class="lg:col-span-7">
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(caseStudy.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-6xl leading-[1.05] reveal">${renderText(caseStudy.title)}</h2>
        </div>
        <div class="lg:col-span-5">
          <p class="text-sm text-gray-600 leading-relaxed reveal">${renderText(caseStudy.intro)}</p>
        </div>
      </div>
      <div class="grid md:grid-cols-3 gap-4 mb-12">
        <div class="md:col-span-2 img-zoom overflow-hidden reveal">
          <img src="${escapeAttribute(caseStudy.images[0].src)}" alt="${renderAttribute(caseStudy.images[0].alt)}" class="w-full h-72 md:h-[420px] object-cover" />
        </div>
        <div class="grid grid-rows-2 gap-4">
          ${caseStudy.images
            .slice(1, 3)
            .map(
              (image) => `
          <div class="img-zoom overflow-hidden reveal">
            <img src="${escapeAttribute(image.src)}" alt="${renderAttribute(image.alt)}" class="w-full h-36 md:h-[202px] object-cover" />
          </div>`,
            )
            .join("")}
        </div>
      </div>
      <div class="grid md:grid-cols-4 gap-8 border-t border-charcoal/15 pt-8">
        ${caseStudy.stats
          .map(
            (stat) => `
        <div class="reveal"><p class="font-display text-4xl text-brass">${renderText(stat.value)}</p><p class="text-[10px] uppercase tracking-[0.18em] text-gray-500 mt-2">${renderText(stat.label)}</p></div>`,
          )
          .join("")}
      </div>
      ${
        caseStudy.quote
          ? `<blockquote class="mt-14 max-w-3xl reveal">
        <p class="font-display text-2xl md:text-3xl leading-snug text-charcoal">${renderText(caseStudy.quote.text)}</p>
        <footer class="mt-5 text-[11px] uppercase tracking-[0.2em] text-gray-500">${renderText(caseStudy.quote.author)}</footer>
      </blockquote>`
          : ""
      }
    </div>
  </section>`;
}

export function renderWorkPage(content: SiteContent): string {
  const page = content.pages.work;
  const marquee = [...page.marquee, ...page.marquee];

  const body = `
${renderNav(content, "our-work.html", "solid")}

  <section data-section="pages.work.hero" class="relative min-h-[72vh] flex items-end bg-charcoal">
    <img src="${escapeAttribute(page.hero.image.src)}" alt="${renderAttribute(page.hero.image.alt)}" class="absolute inset-0 w-full h-full object-cover opacity-55" />
    <div class="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/45 to-charcoal/25"></div>
    <div class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pb-16 lg:pb-20">
      <p class="text-white/50 text-[11px] uppercase tracking-[0.3em] mb-5 reveal">${renderText(page.hero.eyebrow)}</p>
      <h1 class="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95] max-w-4xl reveal">${renderText(page.hero.title)}</h1>
      <div class="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <p class="text-white/55 max-w-lg text-sm leading-relaxed reveal">${renderText(page.hero.body)}</p>
        <div class="flex gap-8 text-[11px] uppercase tracking-[0.2em] text-white/40 reveal">
          ${page.hero.facts
            .map(
              (fact) =>
                `<div><span class="block font-display text-xl text-cream tracking-normal">${renderText(fact.value)}</span>${renderText(fact.label)}</div>`,
            )
            .join("\n          ")}
        </div>
      </div>
    </div>
  </section>

  <section data-section="pages.work.marquee" class="bg-charcoal text-cream py-4 overflow-hidden border-t border-white/10">
    <div class="flex marquee whitespace-nowrap">
      ${marquee
        .map(
          (item) =>
            `<span class="text-[11px] uppercase tracking-[0.4em] mx-10 opacity-50">${renderText(item)}</span>`,
        )
        .join("\n      ")}
    </div>
  </section>

  <section data-section="pages.work.featured" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-between mb-8">
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass reveal">${renderText(page.featured.eyebrow)}</p>
        <p class="text-[11px] uppercase tracking-[0.2em] text-gray-400 reveal">${renderText(page.featured.meta)}</p>
      </div>
      <div class="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <div class="lg:col-span-8 img-zoom overflow-hidden reveal">
          <img src="${escapeAttribute(page.featured.image.src)}" alt="${renderAttribute(page.featured.image.alt)}" class="w-full h-[380px] md:h-[560px] object-cover" />
        </div>
        <div class="lg:col-span-4 lg:pt-6">
          <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.featured.title)}</h2>
          <p class="text-sm text-gray-600 leading-relaxed mt-5 reveal">${renderText(page.featured.body)}</p>
          <dl class="mt-8 divide-y divide-charcoal/10 border-t border-charcoal/10 text-sm">
            ${page.featured.facts
              .map(
                (fact) =>
                  `<div class="flex justify-between gap-4 py-3 reveal"><dt class="text-gray-500">${renderText(fact.label)}</dt><dd class="text-right">${renderText(fact.value)}</dd></div>`,
              )
              .join("\n            ")}
          </dl>
          <div class="mt-8 flex flex-wrap gap-3 reveal">
            ${page.featured.tags
              .map(
                (tag) =>
                  `<span class="text-[10px] uppercase tracking-[0.18em] border border-charcoal/15 px-3 py-1.5">${renderText(tag)}</span>`,
              )
              .join("\n            ")}
          </div>
        </div>
      </div>
    </div>
  </section>

  <section data-section="pages.work.grid" class="pb-24 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-3 reveal">${renderText(page.grid.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl reveal">${renderText(page.grid.title)}</h2>
        </div>
        <p class="text-sm text-gray-500 reveal"><span data-project-count>${page.grid.items.length}</span> ${renderText(page.grid.countLabel)}</p>
      </div>

      <div class="flex flex-wrap gap-2 mb-10 reveal">
        ${page.grid.filters
          .map(
            (filter, index) =>
              `<button class="filter-btn${index === 0 ? " active" : ""}" data-filter="${escapeAttribute(filter.value)}">${renderText(filter.label)}</button>`,
          )
          .join("\n        ")}
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        ${page.grid.items
          .map((project) => {
            const categoryValue = (project.category ?? "")
              .toLowerCase()
              .replace(/\s+/g, "-");
            return `
        <article class="project-card reveal" data-category="${escapeAttribute(categoryValue)}">
          <a href="${escapeAttribute(project.href ?? "#")}" class="block group">
            <div class="img-zoom overflow-hidden">
              <img src="${escapeAttribute(project.image.src)}" alt="${renderAttribute(project.image.alt)}" class="w-full h-64 md:h-72 object-cover" />
            </div>
            <div class="mt-4 flex items-start justify-between gap-4">
              <div>
                <h3 class="font-display text-2xl group-hover:text-brass transition">${renderText(project.title)}</h3>
                <p class="text-sm text-gray-500 mt-1">${renderText(project.meta)}</p>
              </div>
              ${project.category ? `<span class="text-[10px] uppercase tracking-[0.18em] text-brass whitespace-nowrap">${renderText(project.category)}</span>` : ""}
            </div>
            ${project.body ? `<p class="text-sm text-gray-600 leading-relaxed mt-3">${renderText(project.body)}</p>` : ""}
          </a>
        </article>`;
          })
          .join("")}
      </div>
    </div>
  </section>

  ${page.caseStudies
    .map((caseStudy, index) =>
      renderCaseStudy(caseStudy, `pages.work.caseStudies.${index}`),
    )
    .join("\n")}

  <section data-section="pages.work.numbers" class="py-24 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.numbers.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.numbers.title)}</h2>
          <p class="text-sm text-gray-600 leading-relaxed mt-6 max-w-md reveal">${renderText(page.numbers.body)}</p>
        </div>
        <div class="grid grid-cols-2 gap-x-8 gap-y-10">
          ${page.numbers.stats
            .map(
              (stat) => `
          <div class="reveal"><p class="font-display text-5xl counter"${counterData(stat.value)}>${counterValue(stat.value)}</p><p class="text-[10px] uppercase tracking-[0.18em] text-gray-500 mt-2">${renderText(stat.label)}</p></div>`,
            )
            .join("")}
        </div>
      </div>
    </div>
  </section>

  ${page.clients.names.length > 0 ? `<section data-section="pages.work.clients" class="bg-charcoal text-cream py-24 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.clients.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl reveal">${renderText(page.clients.title)}</h2>
        </div>
        <p class="text-sm text-white/45 max-w-sm leading-relaxed reveal">${renderText(page.clients.body)}</p>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 border-t border-l border-white/10">
        ${page.clients.names
          .map(
            (name) =>
              `<div class="border-r border-b border-white/10 p-8 flex items-center justify-center text-center reveal"><span class="font-display text-xl text-white/50">${renderText(name)}</span></div>`,
          )
          .join("\n        ")}
      </div>
    </div>
  </section>` : ""}

${renderCta(page.cta, "light", "pages.work.cta")}

${renderFooter(content, "full")}
`;

  return renderDocument(page.meta.title, page.meta.description, body);
}
