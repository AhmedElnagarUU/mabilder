import type { Facts } from "../../blocks/facts";
import { escapeAttribute, renderText } from "../../content/html";
import { pageHref } from "../agenvo/parts";
import type { PageContext, PhotoCredit } from "../types";

function renderFactLines(facts: Facts): string {
  const lines = [
    facts.address ? `<p>${renderText(facts.address)}</p>` : "",
    facts.email ? `<p><a href="mailto:${escapeAttribute(facts.email)}">${renderText(facts.email)}</a></p>` : "",
    facts.phone
      ? `<p><a href="tel:${escapeAttribute(facts.phone.replace(/\s+/g, ""))}" dir="ltr">${renderText(facts.phone)}</a></p>`
      : "",
  ].filter(Boolean);

  return lines.length === 0 ? "" : `<div class="at-footer-col at-footer-facts">${lines.join("")}</div>`;
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

// Columns separated by thin rules: name and blurb, pages, contact; the legal line sits under a rule.
export function renderFooter(context: PageContext): string {
  const { content, footer, nav } = context;
  const name = content.facts.businessName;

  return `
  <footer class="at-footer">
    <div class="at-footer-cols">
      <div class="at-footer-col">
        <a href="${escapeAttribute(pageHref(context, "index.html"))}" class="at-brand">${renderText(name)}</a>
        <p class="at-footer-blurb">${renderText(footer.blurb)}</p>
      </div>
      <ul class="at-footer-col at-footer-links">
        ${nav.items.map((item) => `<li><a href="${escapeAttribute(pageHref(context, item.href))}">${renderText(item.label)}</a></li>`).join("\n        ")}
      </ul>
      ${renderFactLines(content.facts)}
    </div>
    <div class="at-footer-legal">
      <p>${renderText(footer.copyright)}</p>
      ${renderCredits(footer.photoCreditLabel, context.credits)}
    </div>
  </footer>`;
}
