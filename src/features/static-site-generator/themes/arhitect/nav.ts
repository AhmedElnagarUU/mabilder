import type { Link } from "../../blocks/common";
import { escapeAttribute, renderText } from "../../content/html";
import { pageHref } from "../agenvo/parts";
import type { PageContext } from "../types";

const menuIcon =
  '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';

// The brand mark: the business name in uppercase wide tracking, as in the source.
function navBrand(businessName: string, href: string): string {
  return `<a href="${escapeAttribute(href)}" class="ar-brand"><span class="ar-brand-name">${renderText(businessName)}</span></a>`;
}

export function renderNav(context: PageContext): string {
  const { nav } = context;
  const businessName = context.content.facts.businessName;
  const cta = escapeAttribute(pageHref(context, nav.cta.href));

  const renderItem = (item: Link): string => {
    const current = item.href === `${context.page.slug}.html` ? ' aria-current="page"' : "";

    return `<a href="${escapeAttribute(pageHref(context, item.href))}" class="ar-nav-link"${current}>${renderText(item.label)}</a>`;
  };

  const renderLanguageLink = (classes: string): string => {
    if (!context.alternate) {
      return "";
    }

    const { href, locale } = context.alternate;

    return `<a href="${escapeAttribute(href)}" hreflang="${escapeAttribute(locale)}" lang="${escapeAttribute(locale)}" class="${classes}">${renderText(nav.languageLabel)}</a>`;
  };

  return `
  <nav id="site-nav" class="ar-nav" aria-label="${escapeAttribute(nav.menuLabel)}">
    <div class="ar-nav-bar">
      ${navBrand(businessName, pageHref(context, "index.html"))}
      <div class="ar-nav-links">
        ${nav.items.map(renderItem).join("\n        ")}
      </div>
      <div class="ar-nav-end">
        ${renderLanguageLink("ar-nav-link ar-nav-lang")}
        <button id="menu-toggle" type="button" class="ar-menu-toggle" aria-label="${escapeAttribute(nav.menuLabel)}" aria-expanded="false" aria-controls="mobile-menu">${menuIcon}</button>
      </div>
    </div>
    <div id="mobile-menu" class="ar-menu">
      <div class="ar-menu-inner">
        ${nav.items.map(renderItem).join("\n        ")}
        ${renderLanguageLink("ar-nav-link")}
        <a href="${cta}" class="ar-btn ar-btn-solid">${renderText(nav.cta.label)}</a>
      </div>
    </div>
  </nav>`;
}
