import type { Facts } from "../../blocks/facts";
import { escapeAttribute, renderText } from "../../content/html";
import { pageHref } from "../agenvo/parts";
import type { PageContext, PhotoCredit } from "../types";

const backArrow =
  '<svg class="ar-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';

function renderFactLines(facts: Facts): string {
  const lines = [
    facts.address ? `<p>${renderText(facts.address)}</p>` : "",
    facts.email ? `<p><a href="mailto:${escapeAttribute(facts.email)}">${renderText(facts.email)}</a></p>` : "",
    facts.phone
      ? `<p><a href="tel:${escapeAttribute(facts.phone.replace(/\s+/g, ""))}" dir="ltr">${renderText(facts.phone)}</a></p>`
      : "",
  ].filter(Boolean);

  return lines.length === 0 ? "" : `<div class="ar-footer-facts">${lines.join("")}</div>`;
}

function renderCredits(label: string, credits: PhotoCredit[]): string {
  if (credits.length === 0) {
    return "";
  }

  const links = credits
    .map((credit) => `<a href="${escapeAttribute(credit.url)}" target="_blank" rel="noopener">${renderText(credit.name)}</a>`)
    .join(", ");

  return `<p>${renderText(label)}: ${links}</p>`;
}

// The source footer: small gray centered text over a hairline, with one arrow link home.
export function renderFooter(context: PageContext): string {
  const { content, footer, nav } = context;
  const name = content.facts.businessName;

  return `
  <footer class="ar-footer">
    <a href="${escapeAttribute(pageHref(context, "index.html"))}" class="ar-footer-home">${backArrow}${renderText(name)}</a>
    <p class="ar-footer-blurb">${renderText(footer.blurb)}</p>
    <ul class="ar-footer-links">
      ${nav.items.map((item) => `<li><a href="${escapeAttribute(pageHref(context, item.href))}">${renderText(item.label)}</a></li>`).join("\n      ")}
    </ul>
    ${renderFactLines(content.facts)}
    <div class="ar-footer-legal">
      <p>${renderText(footer.copyright)}</p>
      ${renderCredits(footer.photoCreditLabel, context.credits)}
    </div>
  </footer>`;
}
