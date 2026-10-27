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

function counterValue(value: string): string {
  return /^\d+$/.test(value) ? "0" : renderText(value);
}

function counterData(value: string): string {
  return /^\d+$/.test(value) ? ` data-count="${value}"` : "";
}

export function renderAboutPage(content: SiteContent): string {
  const page = content.pages.about;
  const marquee = [...page.marquee, ...page.marquee];
  const lifeImages = page.studioLife.items;

  const body = `
${renderNav(content, "about.html", "solid")}

  <section data-section="pages.about.hero" class="relative min-h-[82vh] flex items-end bg-charcoal">
    <img src="${escapeAttribute(page.hero.image.src)}" alt="${renderAttribute(page.hero.image.alt)}" class="absolute inset-0 w-full h-full object-cover opacity-55" />
    <div class="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/30"></div>
    <div class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pb-16 lg:pb-20">
      <p class="text-white/50 text-[11px] uppercase tracking-[0.3em] mb-5 reveal">${renderText(page.hero.eyebrow)}</p>
      <h1 class="font-display text-5xl md:text-7xl lg:text-8xl text-cream leading-[0.95] max-w-4xl reveal">${renderText(page.hero.title)}</h1>
      <div class="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <p class="text-white/55 max-w-lg text-sm leading-relaxed reveal">${renderText(page.hero.body)}</p>
        <div class="flex gap-10 text-[11px] uppercase tracking-[0.2em] text-white/40 reveal">
          ${page.hero.facts
            .map(
              (fact) =>
                `<div><span class="block text-cream text-sm tracking-normal font-display text-xl">${renderText(fact.value)}</span>${renderText(fact.label)}</div>`,
            )
            .join("\n          ")}
        </div>
      </div>
    </div>
  </section>

  <section data-section="pages.about.marquee" class="bg-charcoal text-cream py-4 overflow-hidden border-t border-white/10">
    <div class="flex marquee whitespace-nowrap">
      ${marquee
        .map(
          (item) =>
            `<span class="text-[11px] uppercase tracking-[0.4em] mx-10 opacity-50">${renderText(item)}</span>`,
        )
        .join("\n      ")}
    </div>
  </section>

  <section data-section="pages.about.intro" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20">
      <div class="lg:col-span-4">
        <div class="h-px bg-brass line-draw mb-6" data-line></div>
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4">${renderText(page.intro.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-[1.05] reveal">${renderText(page.intro.title)}</h2>
        <div class="mt-8 aspect-[4/5] overflow-hidden img-zoom reveal">
          <img src="${escapeAttribute(page.intro.image.src)}" alt="${renderAttribute(page.intro.image.alt)}" class="w-full h-full object-cover" />
        </div>
        <p class="mt-4 text-xs text-gray-500 leading-relaxed reveal">${renderText(page.intro.caption)}</p>
      </div>
      <div class="lg:col-span-8 lg:pt-16">
        <p class="font-display text-2xl md:text-3xl leading-snug text-charcoal reveal">${renderText(page.intro.quote)}</p>
        <div class="grid md:grid-cols-2 gap-8 mt-10 text-sm text-gray-600 leading-relaxed">
          ${page.intro.paragraphs
            .map(
              (paragraph) =>
                `<p class="reveal">${renderText(paragraph)}</p>`,
            )
            .join("\n          ")}
        </div>
        <div class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-charcoal/10 pt-8">
          ${page.intro.stats
            .map(
              (stat) => `
          <div class="reveal">
            <div class="font-display text-4xl counter"${counterData(stat.value)}>${counterValue(stat.value)}</div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-gray-500 mt-2">${renderText(stat.label)}</p>
          </div>`,
            )
            .join("")}
        </div>
      </div>
    </div>
  </section>

  <section data-section="pages.about.beliefs" class="bg-charcoal text-cream py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.beliefs.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.beliefs.title)}</h2>
        </div>
        <p class="text-sm text-white/45 max-w-sm leading-relaxed reveal">${renderText(page.beliefs.body)}</p>
      </div>
      <div class="grid md:grid-cols-2 gap-x-16 gap-y-12">
        ${page.beliefs.items
          .map(
            (item) => `
        <div class="reveal border-t border-white/10 pt-6">
          <div class="flex items-baseline gap-4">
            <span class="font-display text-2xl text-brass/60">${renderText(item.number ?? "")}</span>
            <h3 class="font-display text-2xl">${renderText(item.title)}</h3>
          </div>
          <p class="text-sm text-white/50 leading-relaxed mt-4">${renderText(item.body)}</p>
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  ${page.timeline.items.length > 0 ? `<section data-section="pages.about.timeline" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20">
      <div class="lg:col-span-4">
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.timeline.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.timeline.title)}</h2>
        <p class="text-sm text-gray-600 leading-relaxed mt-6 reveal">${renderText(page.timeline.body)}</p>
        <a href="${escapeAttribute(page.timeline.link.href)}" class="inline-flex items-center gap-2 mt-8 text-[11px] uppercase tracking-[0.2em] text-brass link-underline reveal">${renderText(page.timeline.link.label)} <i data-lucide="arrow-up-right" class="w-3.5 h-3.5"></i></a>
      </div>
      <div class="lg:col-span-8">
        <div class="space-y-10">
          ${page.timeline.items
            .map(
              (item) => `
          <div class="grid grid-cols-[80px_1fr] gap-6 reveal border-t border-charcoal/10 pt-8">
            <span class="font-display text-3xl text-brass">${renderText(item.year)}</span>
            <div>
              <h3 class="font-medium mb-2">${renderText(item.title)}</h3>
              <p class="text-sm text-gray-600 leading-relaxed">${renderText(item.body)}</p>
            </div>
          </div>`,
            )
            .join("")}
        </div>
      </div>
    </div>
  </section>` : ""}

  <section data-section="pages.about.studioLife" class="bg-sand/60 py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.studioLife.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl reveal">${renderText(page.studioLife.title)}</h2>
        </div>
        <p class="text-sm text-gray-600 max-w-sm leading-relaxed reveal">${renderText(page.studioLife.body)}</p>
      </div>
      <div class="grid md:grid-cols-12 gap-4">
        <div class="md:col-span-7 img-zoom overflow-hidden reveal">
          <img src="${escapeAttribute(lifeImages[0].image.src)}" alt="${renderAttribute(lifeImages[0].image.alt)}" class="w-full h-72 md:h-[420px] object-cover" />
          ${lifeImages[0].caption ? `<p class="mt-3 text-xs text-gray-500">${renderText(lifeImages[0].caption)}</p>` : ""}
        </div>
        <div class="md:col-span-5 grid grid-rows-2 gap-4">
          ${lifeImages
            .slice(1, 3)
            .map(
              (item) => `
          <div class="img-zoom overflow-hidden reveal">
            <img src="${escapeAttribute(item.image.src)}" alt="${renderAttribute(item.image.alt)}" class="w-full h-52 md:h-[202px] object-cover" />
          </div>`,
            )
            .join("")}
        </div>
        ${lifeImages
          .slice(3, 6)
          .map(
            (item) => `
        <div class="md:col-span-4 img-zoom overflow-hidden reveal">
          <img src="${escapeAttribute(item.image.src)}" alt="${renderAttribute(item.image.alt)}" class="w-full h-64 object-cover" />
          ${item.caption ? `<p class="mt-3 text-xs text-gray-500">${renderText(item.caption)}</p>` : ""}
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.about.leadership" class="py-24 lg:py-32 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.leadership.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl reveal">${renderText(page.leadership.title)}</h2>
        </div>
        <a href="${escapeAttribute(page.leadership.link.href)}" class="text-[11px] uppercase tracking-[0.2em] text-brass link-underline reveal">${renderText(page.leadership.link.label)}</a>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        ${page.leadership.items
          .map(
            (person) => `
        <a href="${escapeAttribute(person.href)}" class="group reveal">
          <div class="portrait overflow-hidden aspect-[4/5] bg-charcoal/5">
            <img src="${escapeAttribute(person.image.src)}" alt="${renderAttribute(person.image.alt)}" class="w-full h-full object-cover" />
          </div>
          <div class="mt-5 flex items-start justify-between">
            <div>
              <h3 class="font-display text-2xl">${renderText(person.name)}</h3>
              <p class="text-[11px] uppercase tracking-[0.2em] text-brass mt-1">${renderText(person.role)}</p>
            </div>
            <i data-lucide="arrow-up-right" class="w-4 h-4 text-gray-400 group-hover:text-brass transition"></i>
          </div>
          <p class="text-sm text-gray-600 leading-relaxed mt-3">${renderText(person.bio)}</p>
        </a>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  ${page.awards.items.length > 0 ? `<section data-section="pages.about.awards" class="bg-charcoal text-cream py-24 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
      <div class="lg:col-span-4">
        <p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.awards.eyebrow)}</p>
        <h2 class="font-display text-4xl leading-tight reveal">${renderText(page.awards.title)}</h2>
        <p class="text-sm text-white/45 leading-relaxed mt-6 reveal">${renderText(page.awards.body)}</p>
      </div>
      <div class="lg:col-span-8 divide-y divide-white/10 border-t border-white/10">
        ${page.awards.items
          .map(
            (award) => `
        <div class="flex items-center justify-between gap-6 py-5 reveal">
          <div class="flex items-baseline gap-6"><span class="text-[11px] text-brass tracking-widest">${renderText(award.year)}</span><p class="text-sm">${renderText(award.title)}</p></div>
          <i data-lucide="award" class="w-4 h-4 text-white/30"></i>
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>` : ""}

${renderCta(page.cta, "light", "pages.about.cta")}

${renderFooter(content, "full")}
`;

  return renderDocument(page.meta.title, page.meta.description, body);
}
