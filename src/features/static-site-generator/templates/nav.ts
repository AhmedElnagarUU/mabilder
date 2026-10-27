import { escapeAttribute, renderText } from "../content/html";
import type { SiteContent } from "../content/types";

type NavVariant = "overlay" | "solid";

export function renderNav(
  content: SiteContent,
  activeFile: string,
  variant: NavVariant,
): string {
  const { site, navigation } = content;
  const ctaHref =
    activeFile === "contact.html" ? "#enquiry" : navigation.cta.href;

  if (variant === "overlay") {
    return `
  <nav data-section="navigation" class="fixed top-0 left-0 right-0 z-50 mix-blend-difference">
    <div class="max-w-7xl mx-auto px-8 lg:px-16 py-6 flex items-center justify-between text-white">
      <a data-section="site" href="${escapeAttribute(site.homeHref)}" class="font-display text-2xl font-semibold tracking-wide">${renderText(site.name)}</a>
      <div class="hidden md:flex items-center gap-10 text-xs uppercase tracking-[0.2em]">
        ${navigation.items
          .map(
            (item) =>
              `<a href="${escapeAttribute(item.href)}" class="hover:opacity-70 transition">${renderText(item.label)}</a>`,
          )
          .join("\n        ")}
      </div>
      <a href="${escapeAttribute(ctaHref)}" class="text-xs uppercase tracking-[0.2em] border border-white/40 px-5 py-2 hover:bg-white hover:text-charcoal transition">${renderText(navigation.cta.label)}</a>
    </div>
  </nav>`;
  }

  return `
  <nav data-section="navigation" id="site-nav" class="fixed top-0 left-0 right-0 z-50 text-white">
    <div class="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between">
      <a data-section="site" href="${escapeAttribute(site.homeHref)}" class="font-display text-2xl font-semibold tracking-wide">${renderText(site.name)}</a>
      <div class="hidden lg:flex items-center gap-9 text-[11px] uppercase tracking-[0.2em]">
        ${navigation.items
          .map((item) => {
            const active = item.href === activeFile;
            return `<a href="${escapeAttribute(item.href)}" class="nav-link"${active ? ' aria-current="page"' : ""}>${renderText(item.label)}</a>`;
          })
          .join("\n        ")}
      </div>
      <div class="flex items-center gap-4">
        <a href="${escapeAttribute(ctaHref)}" class="hidden sm:inline-flex text-[11px] uppercase tracking-[0.2em] border border-white/30 px-5 py-2.5 hover:bg-white hover:text-charcoal transition">${renderText(navigation.cta.label)}</a>
        <button id="menu-toggle" class="lg:hidden p-1" aria-label="${escapeAttribute(navigation.menuLabel)}" aria-expanded="false"><i data-lucide="menu" class="w-5 h-5"></i></button>
      </div>
    </div>
    <div id="mobile-menu" class="menu-panel lg:hidden bg-charcoal/95 border-t border-white/10">
      <div class="px-6 py-6 flex flex-col text-sm uppercase tracking-[0.18em]">
        ${navigation.items
          .map(
            (item) =>
              `<a href="${escapeAttribute(item.href)}" class="py-3 border-b border-white/5">${renderText(item.label)}</a>`,
          )
          .join("\n        ")}
        <a href="${escapeAttribute(ctaHref)}" class="mt-4 text-center bg-brass text-charcoal px-5 py-3 text-[11px] font-semibold tracking-widest">${renderText(navigation.mobileCtaLabel)}</a>
      </div>
    </div>
  </nav>`;
}
