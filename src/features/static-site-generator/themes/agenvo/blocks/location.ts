import { escapeAttribute, renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import { getToneStyle, renderHeader, renderSection, sectionPadding } from "../parts";

function renderLink(href: string, text: string): string {
  return `<p><a href="${escapeAttribute(href)}" class="link-underline">${renderText(text)}</a></p>`;
}

export function renderLocation(block: ThemeBlock<"location">, context: BlockContext): string {
  const { props } = block;
  const style = getToneStyle(context.tone);
  const card = context.tone === "dark" ? "bg-white/5 border border-white/10" : "bg-sand/60";

  const inner = `
    <div class="max-w-7xl mx-auto">${renderHeader(props.eyebrow, props.title, props.body, style)}
      <article class="${card} p-8 md:p-10 grid md:grid-cols-2 gap-8 reveal">
        <div class="flex items-start gap-3">
          <i data-lucide="map-pin" class="w-5 h-5 text-brass shrink-0 mt-1"></i>
          <a href="${escapeAttribute(props.mapHref)}" target="_blank" rel="noopener" class="font-display text-2xl leading-snug link-underline">${renderText(props.address)}</a>
        </div>
        <div class="text-sm ${style.body} space-y-2">
          ${props.phone ? renderLink(`tel:${props.phone.replace(/\s+/g, "")}`, props.phone) : ""}
          ${props.email ? renderLink(`mailto:${props.email}`, props.email) : ""}
        </div>
      </article>
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
