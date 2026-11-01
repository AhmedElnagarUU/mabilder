import type { Facts } from "../../blocks/facts";
import { escapeAttribute, renderText } from "../../content/html";
import { pageHref } from "../agenvo/parts";
import type { PageContext, PhotoCredit } from "../types";
import { renderLogoMark } from "./nav";

function renderFactLines(facts: Facts): string {
  const lines = [
    facts.address ? `<p>${renderText(facts.address)}</p>` : "",
    facts.email ? `<p><a href="mailto:${escapeAttribute(facts.email)}">${renderText(facts.email)}</a></p>` : "",
    facts.phone
      ? `<p><a href="tel:${escapeAttribute(facts.phone.replace(/\s+/g, ""))}" dir="ltr">${renderText(facts.phone)}</a></p>`
      : "",
  ].filter(Boolean);

  return lines.length === 0 ? "" : `<div class="au-footer-facts">${lines.join("")}</div>`;
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

export function renderFooter(context: PageContext): string {
  const { content, footer, nav } = context;
  const name = content.facts.businessName;

  return `
  <footer class="au-footer">
    <div class="au-footer-inner">
      <a href="${escapeAttribute(pageHref(context, "index.html"))}" class="au-brand au-brand-center">${renderLogoMark(name)}<span class="au-brand-name">${renderText(name)}</span></a>
      <p class="au-footer-blurb">${renderText(footer.blurb)}</p>
      <ul class="au-footer-links">
        ${nav.items.map((item) => `<li><a href="${escapeAttribute(pageHref(context, item.href))}">${renderText(item.label)}</a></li>`).join("\n        ")}
      </ul>
      ${renderFactLines(content.facts)}
      <div class="au-footer-legal">
        <p>${renderText(footer.copyright)}</p>
        ${renderCredits(footer.photoCreditLabel, context.credits)}
      </div>
    </div>
  </footer>`;
}
