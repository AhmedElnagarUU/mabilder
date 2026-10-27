import {
  escapeAttribute,
  renderAttribute,
  renderText,
} from "../content/html";
import type { SiteContent } from "../content/types";
import { renderDocument } from "./document";
import { renderFooter } from "./footer";
import { renderNav } from "./nav";

function counterValue(value: string): string {
  return /^\d+$/.test(value) ? "0" : renderText(value);
}

function counterData(value: string): string {
  return /^\d+$/.test(value) ? ` data-count="${value}"` : "";
}

export function renderHomePage(content: SiteContent): string {
  const page = content.pages.home;
  const marquee = [...page.marquee, ...page.marquee];
  const featuredProjects = page.projects.items.slice(0, 2);
  const smallProjects = page.projects.items.slice(2);

  const body = `
${renderNav(content, "index.html", "overlay")}

  <section data-section="pages.home.hero" class="relative h-screen min-h-[600px] flex items-end">
    <img src="${escapeAttribute(page.hero.image.src)}" alt="${renderAttribute(page.hero.image.alt)}" class="absolute inset-0 w-full h-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent"></div>
    <div class="relative z-10 w-full max-w-7xl mx-auto px-8 lg:px-16 pb-16 lg:pb-24">
      <p class="text-white/70 text-xs uppercase tracking-[0.3em] mb-4 reveal">${renderText(page.hero.eyebrow)}</p>
      <h1 class="font-display text-5xl md:text-7xl lg:text-8xl text-white leading-[0.95] max-w-4xl reveal">${renderText(page.hero.title)}</h1>
      <p class="text-white/60 mt-6 max-w-md text-sm leading-relaxed reveal">${renderText(page.hero.body)}</p>
    </div>
  </section>

  <section data-section="pages.home.marquee" class="bg-charcoal text-cream py-5 overflow-hidden">
    <div class="flex marquee whitespace-nowrap">
      ${marquee
        .map(
          (item) =>
            `<span class="text-sm uppercase tracking-[0.4em] mx-12 opacity-60">${renderText(item)}</span>`,
        )
        .join("\n      ")}
    </div>
  </section>

  <section data-section="pages.home.stats" class="bg-charcoal text-cream border-t border-white/10">
    <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
      ${page.stats
        .map(
          (stat) => `
      <div class="py-10 px-8 text-center reveal">
        <div class="font-display text-4xl md:text-5xl counter"${counterData(stat.value)}>${counterValue(stat.value)}</div>
        <div class="text-xs uppercase tracking-widest text-white/50 mt-2">${renderText(stat.label)}</div>
      </div>`,
        )
        .join("")}
    </div>
  </section>

  <section data-section="pages.home.studio" id="studio" class="py-24 lg:py-32 px-8 lg:px-16">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
      <div>
        <div class="h-px bg-brass line-draw mb-6" data-line></div>
        <p class="text-xs uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.studio.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-tight reveal">${renderText(page.studio.title)}</h2>
        ${page.studio.paragraphs
          .map(
            (paragraph) =>
              `<p class="text-gray-600 mt-4 leading-relaxed reveal">${renderText(paragraph)}</p>`,
          )
          .join("\n        ")}
      </div>
      <div class="grid grid-cols-2 gap-4 reveal">
        ${page.studio.images
          .map((image, index) => {
            const extra =
              index === 1
                ? " mt-8"
                : index === 2
                  ? " col-span-2"
                  : "";
            return `<img src="${escapeAttribute(image.src)}" alt="${renderAttribute(image.alt)}" class="rounded-sm w-full h-48 object-cover${extra}" />`;
          })
          .join("\n        ")}
      </div>
    </div>
  </section>

  <section data-section="pages.home.process" id="process" class="py-24 bg-charcoal text-cream px-8 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <p class="text-xs uppercase tracking-[0.3em] text-brass mb-4 reveal">${renderText(page.process.eyebrow)}</p>
      <h2 class="font-display text-4xl md:text-5xl mb-16 reveal">${renderText(page.process.title)}</h2>
      <div class="grid md:grid-cols-4 gap-8">
        ${page.process.steps
          .map(
            (step) => `
        <div class="reveal">
          <div class="font-display text-5xl text-brass/40 mb-4">${renderText(step.number ?? "")}</div>
          <h3 class="font-medium mb-2">${renderText(step.title)}</h3>
          <p class="text-sm text-white/50 leading-relaxed">${renderText(step.body)}</p>
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.home.projects" id="work" class="py-24 px-8 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-end justify-between mb-12">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-brass mb-2 reveal">${renderText(page.projects.eyebrow)}</p>
          <h2 class="font-display text-4xl md:text-5xl reveal">${renderText(page.projects.title)}</h2>
        </div>
        <a href="${escapeAttribute(page.projects.link.href)}" class="text-xs uppercase tracking-widest text-brass hover:underline reveal hidden md:inline-flex items-center gap-1">${renderText(page.projects.link.label)} <i data-lucide="arrow-right" class="w-3 h-3"></i></a>
      </div>
      <div class="grid md:grid-cols-12 gap-4">
        ${featuredProjects
          .map(
            (project, index) => `
        <div class="md:col-span-${index === 0 ? "7" : "5"} img-zoom overflow-hidden rounded-sm reveal">
          <img src="${escapeAttribute(project.image.src)}" alt="${renderAttribute(project.image.alt)}" class="w-full ${index === 0 ? "h-80 md:h-[480px]" : "h-64 md:h-[480px]"} object-cover" />
          <div class="mt-4 flex justify-between items-start">
            <div><h3 class="font-display text-2xl">${renderText(project.title)}</h3><p class="text-sm text-gray-500 mt-1">${renderText(project.meta)}</p></div>
            ${project.category ? `<span class="text-xs text-brass uppercase tracking-widest">${renderText(project.category)}</span>` : ""}
          </div>
        </div>`,
          )
          .join("")}
        ${smallProjects
          .map(
            (project) => `
        <div class="md:col-span-4 img-zoom overflow-hidden rounded-sm reveal">
          <img src="${escapeAttribute(project.image.src)}" alt="${renderAttribute(project.image.alt)}" class="w-full h-64 object-cover" />
          <div class="mt-4"><h3 class="font-display text-xl">${renderText(project.title)}</h3><p class="text-sm text-gray-500">${renderText(project.meta)}</p></div>
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.home.services" class="py-24 bg-cream border-t border-charcoal/10 px-8 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <p class="text-xs uppercase tracking-[0.3em] text-brass mb-3 reveal">${renderText(page.services.eyebrow)}</p>
      <h2 class="font-display text-4xl md:text-5xl mb-12 reveal">${renderText(page.services.title)}</h2>
      <div class="grid md:grid-cols-3 gap-12">
        ${page.services.items
          .map(
            (service) => `
        <div class="reveal">
          <div class="w-12 h-px bg-brass mb-6"></div>
          <i data-lucide="${escapeAttribute(service.icon ?? "building-2")}" class="w-6 h-6 text-brass mb-4"></i>
          <h3 class="font-display text-2xl mb-3">${renderText(service.title)}</h3>
          <p class="text-sm text-gray-600 leading-relaxed">${renderText(service.body)}</p>
        </div>`,
          )
          .join("")}
      </div>
    </div>
  </section>

  <section data-section="pages.home.contact" id="contact" class="py-24 bg-charcoal text-cream px-8 lg:px-16">
    <div class="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16">
      <div class="reveal">
        <p class="text-xs uppercase tracking-[0.3em] text-brass mb-4">${renderText(page.contact.eyebrow)}</p>
        <h2 class="font-display text-4xl md:text-5xl leading-tight">${renderText(page.contact.title)}</h2>
        <p class="text-white/50 mt-6 text-sm leading-relaxed">${renderText(page.contact.body)}</p>
        <div class="mt-10 space-y-3 text-sm text-white/60">
          <p class="flex items-center gap-2"><i data-lucide="mail" class="w-4 h-4 text-brass"></i> ${renderText(page.contact.email)}</p>
          <p class="flex items-center gap-2"><i data-lucide="phone" class="w-4 h-4 text-brass"></i> ${renderText(page.contact.phone)}</p>
          <p class="flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-brass"></i> ${renderText(page.contact.address)}</p>
        </div>
      </div>
      <form data-form class="space-y-5 reveal">
        <div class="grid grid-cols-2 gap-4">
          <input type="text" placeholder="${renderAttribute(page.contact.form.namePlaceholder)}" class="bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-brass transition" />
          <input type="email" placeholder="${renderAttribute(page.contact.form.emailPlaceholder)}" class="bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-brass transition" />
        </div>
        <input type="text" placeholder="${renderAttribute(page.contact.form.projectTypePlaceholder)}" class="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-brass transition" />
        <textarea rows="4" placeholder="${renderAttribute(page.contact.form.messagePlaceholder)}" class="w-full bg-white/5 border border-white/10 rounded-sm px-4 py-3 text-sm placeholder:text-white/30 focus:outline-none focus:border-brass transition resize-none"></textarea>
        <button class="bg-brass text-charcoal text-xs uppercase tracking-widest font-semibold px-8 py-3.5 hover:bg-cream transition">${renderText(page.contact.form.submitLabel)}</button>
        <p data-form-message class="hidden text-sm text-brass">${renderText(page.contact.form.successMessage)}</p>
      </form>
    </div>
  </section>

${renderFooter(content, "minimal")}
`;

  return renderDocument(page.meta.title, page.meta.description, body);
}
