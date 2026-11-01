import type { Link } from "../../blocks/common";
import { escapeAttribute, renderText } from "../../content/html";
import { pageHref } from "../agenvo/parts";
import type { NavContent, PageContext } from "../types";

const menuIcon =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true" focusable="false"><path d="M3 7h18M3 12h18M3 17h18"/></svg>';

// First letter of the business name, shown in the logo box.
export function renderLogoMark(businessName: string): string {
  const letter = Array.from(businessName.trim())[0] ?? "";

  return `<span class="au-logo-box" aria-hidden="true">${renderText(letter)}</span>`;
}

function renderLink(link: Link, context: PageContext): string {
  const current = link.href === `${context.page.slug}.html` ? ' aria-current="page"' : "";

  return `<a href="${escapeAttribute(pageHref(context, link.href))}" class="au-nav-link"${current}>${renderText(link.label)}</a>`;
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
  const cta = escapeAttribute(pageHref(context, nav.cta.href));

  return `
  <nav id="site-nav" class="au-nav" aria-label="${escapeAttribute(nav.menuLabel)}">
    <div class="au-nav-bar">
      <a href="${escapeAttribute(pageHref(context, "index.html"))}" class="au-brand">${renderLogoMark(businessName)}<span class="au-brand-name">${renderText(businessName)}</span></a>
      <div class="au-nav-links">
        ${nav.items.map((item) => renderLink(item, context)).join("\n        ")}
      </div>
      <div class="au-nav-end">
        ${renderLanguageLink(context, nav, "au-nav-link au-nav-lang")}
        <a href="${cta}" class="au-btn au-btn-outline au-nav-cta">${renderText(nav.cta.label)}</a>
        <button id="menu-toggle" type="button" class="au-menu-toggle" aria-label="${escapeAttribute(nav.menuLabel)}" aria-expanded="false" aria-controls="mobile-menu">${menuIcon}</button>
      </div>
    </div>
    <div id="mobile-menu" class="au-menu">
      <div class="au-menu-inner">
        ${nav.items.map((item) => renderLink(item, context)).join("\n        ")}
        ${renderLanguageLink(context, nav, "au-nav-link")}
        <a href="${cta}" class="au-btn au-btn-outline">${renderText(nav.cta.label)}</a>
      </div>
    </div>
  </nav>`;
}
