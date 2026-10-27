import { escapeAttribute, renderText } from "../content/html";
import type { CtaContent } from "../content/types";

type CtaVariant = "light" | "dark";

export function renderCta(
  cta: CtaContent,
  variant: CtaVariant,
  pathPrefix: string,
): string {
  const dark = variant === "dark";
  const wrapper = dark ? "bg-charcoal text-cream" : "bg-sand/70";
  const body = dark ? "text-white/50" : "text-gray-600";
  const primary = dark
    ? "bg-brass text-charcoal hover:bg-cream"
    : "bg-charcoal text-cream hover:bg-brass hover:text-charcoal";
  const secondary = dark
    ? "border border-white/20 hover:border-brass hover:text-brass"
    : "border border-charcoal/20 hover:border-brass hover:text-brass";

  return `
  <section data-section="${pathPrefix}" class="py-24 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto ${wrapper} px-8 py-16 md:px-16 md:py-20 grid lg:grid-cols-2 gap-10 items-center reveal">
      <div>
        ${cta.eyebrow ? `<p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4">${renderText(cta.eyebrow)}</p>` : ""}
        <h2 class="font-display text-4xl md:text-5xl leading-tight">${renderText(cta.title)}</h2>
      </div>
      <div class="lg:justify-self-end">
        <p class="text-sm ${body} leading-relaxed mb-6 max-w-sm">${renderText(cta.body)}</p>
        <div class="flex flex-wrap gap-3">
          <a href="${escapeAttribute(cta.primary.href)}" class="inline-flex items-center gap-3 ${primary} text-[11px] uppercase tracking-[0.2em] px-8 py-4 transition">${renderText(cta.primary.label)} <i data-lucide="arrow-right" class="w-4 h-4"></i></a>
          ${
            cta.secondary
              ? `<a href="${escapeAttribute(cta.secondary.href)}" class="inline-flex items-center gap-3 ${secondary} text-[11px] uppercase tracking-[0.2em] px-8 py-4 transition">${renderText(cta.secondary.label)}</a>`
              : ""
          }
        </div>
      </div>
    </div>
  </section>`;
}
