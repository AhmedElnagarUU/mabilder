import { escapeAttribute, renderText } from "../content/html";
import type { SiteContent } from "../content/types";

type FooterVariant = "minimal" | "full";

export function renderFooter(
  content: SiteContent,
  variant: FooterVariant,
): string {
  const { site, navigation, footer } = content;

  if (variant === "minimal") {
    return `
  <footer data-section="footer" class="py-10 bg-charcoal text-white/40 text-xs text-center border-t border-white/10">
    <div data-section="navigation" class="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-5 uppercase tracking-[0.18em] text-[10px]">
      ${navigation.items
        .map(
          (item) =>
            `<a href="${escapeAttribute(item.href)}" class="hover:text-brass transition">${renderText(item.label)}</a>`,
        )
        .join("\n      ")}
    </div>
    <a data-section="site" href="${escapeAttribute(site.homeHref)}" class="hover:text-brass transition inline-flex items-center gap-1"><i data-lucide="arrow-left" class="w-3 h-3"></i> ${renderText(site.name)}</a>
    <p class="mt-2">${renderText(footer.copyright)}</p>
  </footer>`;
  }

  return `
  <footer data-section="footer" class="bg-charcoal text-cream">
    <div class="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-16 pb-8">
      <div class="grid gap-12 lg:grid-cols-12">
        <div class="lg:col-span-4">
          <a data-section="site" href="${escapeAttribute(site.homeHref)}" class="font-display text-3xl">${renderText(site.name)}</a>
          <p class="mt-5 text-sm text-white/45 leading-relaxed max-w-xs">${renderText(footer.blurb)}</p>
          <div class="mt-6 flex gap-3">
            ${footer.social
              .map(
                (item) =>
                  `<a href="${escapeAttribute(item.href)}" aria-label="${escapeAttribute(item.label)}" class="w-9 h-9 border border-white/15 flex items-center justify-center hover:border-brass hover:text-brass transition"><i data-lucide="${escapeAttribute(item.icon)}" class="w-4 h-4"></i></a>`,
              )
              .join("\n            ")}
          </div>
        </div>
        ${footer.columns
          .map(
            (column, index) => `
        <div class="lg:col-span-${index === 0 ? "2" : "3"}">
          <p class="text-[10px] uppercase tracking-[0.25em] text-brass mb-5">${renderText(column.title)}</p>
          <ul class="space-y-3 text-sm text-white/55">
            ${column.links
              .map(
                (link) =>
                  `<li><a href="${escapeAttribute(link.href)}" class="hover:text-cream transition">${renderText(link.label)}</a></li>`,
              )
              .join("\n            ")}
          </ul>
        </div>`,
          )
          .join("")}
        <div class="lg:col-span-3">
          <p class="text-[10px] uppercase tracking-[0.25em] text-brass mb-5">Studios</p>
          <div class="space-y-4 text-sm text-white/55 leading-relaxed">
            ${footer.studios
              .map(
                (studio) =>
                  `<p>${studio.lines.map((line) => `<span>${renderText(line)}</span>`).join("<br />")}</p>`,
              )
              .join("\n            ")}
            <p><a href="mailto:${escapeAttribute(footer.studios[0].email)}" class="hover:text-cream transition">${renderText(footer.studios[0].email)}</a><br /><a href="${escapeAttribute(footer.studios[0].phoneHref)}" class="hover:text-cream transition">${renderText(footer.studios[0].phone)}</a></p>
          </div>
        </div>
      </div>
      <div class="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 text-[11px] text-white/35">
        <p>${renderText(footer.copyright)}</p>
        <div class="flex gap-6">
          ${footer.legal
            .map(
              (link) =>
                `<a href="${escapeAttribute(link.href)}" class="hover:text-brass transition">${renderText(link.label)}</a>`,
            )
            .join("\n          ")}
        </div>
      </div>
    </div>
  </footer>`;
}
