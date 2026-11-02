import type { Link } from "../../blocks/common";
import { escapeAttribute, renderText } from "../../content/html";
import { pageHref } from "../agenvo/parts";
import type { NavContent, PageContext } from "../types";

const menuIcon =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true" focusable="false"><path d="M3 8h18M3 16h18"/></svg>';

function renderLink(link: Link, context: PageContext): string {
  const current = link.href === `${context.page.slug}.html` ? ' aria-current="page"' : "";

  return `<a href="${escapeAttribute(pageHref(context, link.href))}" class="at-nav-link"${current}>${renderText(link.label)}</a>`;
}

function renderLanguageLink(context: PageContext, nav: NavContent, classes: string): string {
  if (!context.alternate) {
    return "";
  }

  const { href, locale } = context.alternate;

  return `<a href="${escapeAttribute(href)}" hreflang="${escapeAttribute(locale)}" lang="${escapeAttribute(locale)}" class="${classes}">${renderText(nav.languageLabel)}</a>`;
}

// The wordmark sits in the middle; the links split between the two sides.
export function renderNav(context: PageContext): string {
  const { nav } = context;
  const businessName = context.content.facts.businessName;
  const cta = escapeAttribute(pageHref(context, nav.cta.href));
  const half = Math.ceil(nav.items.length / 2);
  const startLinks = nav.items.slice(0, half).map((item) => renderLink(item, context)).join("\n        ");
  const endLinks = nav.items.slice(half).map((item) => renderLink(item, context)).join("\n        ");

  return `
  <nav id="site-nav" class="at-nav" aria-label="${escapeAttribute(nav.menuLabel)}">
    <div class="at-nav-bar">
      <div class="at-nav-side at-nav-start">
        ${startLinks}
      </div>
      <a href="${escapeAttribute(pageHref(context, "index.html"))}" class="at-brand">${renderText(businessName)}</a>
      <div class="at-nav-side at-nav-end">
        ${endLinks}
        ${renderLanguageLink(context, nav, "at-nav-link")}
        <a href="${cta}" class="at-nav-cta">${renderText(nav.cta.label)}</a>
      </div>
      <button id="menu-toggle" type="button" class="at-menu-toggle" aria-label="${escapeAttribute(nav.menuLabel)}" aria-expanded="false" aria-controls="mobile-menu">${menuIcon}</button>
    </div>
    <div id="mobile-menu" class="at-menu">
      <div class="at-menu-inner">
        ${nav.items.map((item) => renderLink(item, context)).join("\n        ")}
        ${renderLanguageLink(context, nav, "at-nav-link")}
        <a href="${cta}" class="at-btn at-btn-solid">${renderText(nav.cta.label)}</a>
      </div>
    </div>
  </nav>`;
}
