import type { Facts } from "../../blocks/facts";
import { escapeAttribute, renderText } from "../../content/html";
import type { PageContext, PhotoCredit } from "../types";
import { pageHref } from "./parts";

function renderFactLines(facts: Facts): string {
  const lines = [
    facts.address ? `<p>${renderText(facts.address)}</p>` : "",
    facts.email
      ? `<p><a href="mailto:${escapeAttribute(facts.email)}" class="hover:text-cream transition">${renderText(facts.email)}</a></p>`
      : "",
    facts.phone
      ? `<p><a href="tel:${escapeAttribute(facts.phone.replace(/\s+/g, ""))}" class="hover:text-cream transition">${renderText(facts.phone)}</a></p>`
      : "",
  ].filter(Boolean);

  return lines.join("\n            ");
}

function renderCredits(label: string, credits: PhotoCredit[]): string {
  if (credits.length === 0) {
    return "";
  }

  const links = credits
    .map(
      (credit) =>
        `<a href="${escapeAttribute(credit.url)}" target="_blank" rel="noopener" class="hover:text-brass transition">${renderText(credit.name)}</a>`,
    )
    .join(", ");

  return `<p>${renderText(label)}: ${links}</p>`;
}

export function renderFooter(context: PageContext): string {
  const { content, footer, nav } = context;

  return `
  <footer class="bg-charcoal text-cream border-t border-white/10">
    <div class="max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-16 pb-8">
      <div class="grid gap-12 lg:grid-cols-12">
        <div class="lg:col-span-5">
          <a href="${escapeAttribute(pageHref(context, "index.html"))}" class="font-display text-3xl">${renderText(content.facts.businessName)}</a>
          <p class="mt-5 text-sm text-white/45 leading-relaxed max-w-xs">${renderText(footer.blurb)}</p>
        </div>
        <ul class="lg:col-span-3 space-y-3 text-sm text-white/55">
          ${nav.items
            .map(
              (item) =>
                `<li><a href="${escapeAttribute(pageHref(context, item.href))}" class="hover:text-cream transition">${renderText(item.label)}</a></li>`,
            )
            .join("\n          ")}
        </ul>
        <div class="lg:col-span-4 space-y-3 text-sm text-white/55 leading-relaxed">
            ${renderFactLines(content.facts)}
        </div>
      </div>
      <div class="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between gap-4 text-[11px] text-white/35">
        <p>${renderText(footer.copyright)}</p>
        ${renderCredits(footer.photoCreditLabel, context.credits)}
      </div>
    </div>
  </footer>`;
}
