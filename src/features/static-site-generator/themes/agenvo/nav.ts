import type { Link } from "../../blocks/common";
import { escapeAttribute, renderText } from "../../content/html";
import type { NavContent, PageContext } from "../types";
import { pageHref } from "./parts";

function isCurrentPage(link: Link, context: PageContext): boolean {
  return link.href === `${context.page.slug}.html`;
}

function renderDesktopItem(link: Link, context: PageContext): string {
  const current = isCurrentPage(link, context) ? ' aria-current="page"' : "";
  return `<a href="${escapeAttribute(pageHref(context, link.href))}" class="nav-link"${current}>${renderText(link.label)}</a>`;
}

function renderLanguageLink(context: PageContext, nav: NavContent, classes: string): string {
  if (!context.alternate) {
    return "";
  }

  const { href, locale } = context.alternate;
  return `<a href="${escapeAttribute(href)}" hreflang="${escapeAttribute(locale)}" lang="${escapeAttribute(locale)}" class="${classes}">${renderText(nav.languageLabel)}</a>`;
}

export function renderNav(context: PageContext): string {
  const { nav } = context;
  const businessName = context.content.facts.businessName;

  return `
  <nav id="site-nav" class="fixed top-0 inset-x-0 z-50 text-white">
    <div class="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 py-5 flex items-center justify-between gap-6">
      <a href="${escapeAttribute(pageHref(context, "index.html"))}" class="font-display text-2xl font-semibold tracking-wide">${renderText(businessName)}</a>
      <div class="hidden lg:flex items-center gap-9 text-[11px] uppercase tracking-[0.2em]">
        ${nav.items.map((item) => renderDesktopItem(item, context)).join("\n        ")}
      </div>
      <div class="flex items-center gap-4">
        ${renderLanguageLink(context, nav, "hidden sm:inline-flex text-[11px] uppercase tracking-[0.2em] nav-link")}
        <a href="${escapeAttribute(pageHref(context, nav.cta.href))}" class="hidden sm:inline-flex text-[11px] uppercase tracking-[0.2em] border border-white/30 px-5 py-2.5 hover:bg-white hover:text-charcoal transition">${renderText(nav.cta.label)}</a>
        <button id="menu-toggle" class="lg:hidden p-1" aria-label="${escapeAttribute(nav.menuLabel)}" aria-expanded="false"><i data-lucide="menu" class="w-5 h-5"></i></button>
      </div>
    </div>
    <div id="mobile-menu" class="menu-panel lg:hidden bg-charcoal/95 border-t border-white/10">
      <div class="px-6 py-6 flex flex-col text-sm uppercase tracking-[0.18em]">
        ${nav.items
          .map(
            (item) =>
              `<a href="${escapeAttribute(pageHref(context, item.href))}" class="py-3 border-b border-white/5">${renderText(item.label)}</a>`,
          )
          .join("\n        ")}
        ${renderLanguageLink(context, nav, "py-3 border-b border-white/5")}
        <a href="${escapeAttribute(pageHref(context, nav.cta.href))}" class="mt-4 text-center bg-brass text-charcoal px-5 py-3 text-[11px] font-semibold tracking-widest">${renderText(nav.cta.label)}</a>
      </div>
    </div>
  </nav>`;
}
