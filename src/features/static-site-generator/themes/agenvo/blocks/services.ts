import type { Card } from "../../../blocks/common";
import { escapeAttribute, renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import {
  getToneStyle,
  renderHeader,
  renderSection,
  sectionPadding,
  type ToneStyle,
} from "../parts";

function renderIcon(icon: string | undefined, classes: string): string {
  if (!icon) {
    return "";
  }

  return `<i data-lucide="${escapeAttribute(icon)}" class="${classes}"></i>`;
}

function renderColumn(item: Card, style: ToneStyle): string {
  return `
        <div class="reveal">
          <div class="w-12 h-px bg-brass mb-6"></div>
          ${renderIcon(item.icon, "w-6 h-6 text-brass mb-4")}
          <h3 class="font-display text-2xl mb-3">${renderText(item.title)}</h3>
          <p class="text-sm ${style.body} leading-relaxed">${renderText(item.body)}</p>
        </div>`;
}

function renderListItem(item: Card, style: ToneStyle): string {
  return `
        <div class="border-t ${style.border} pt-6 reveal">
          <div class="flex items-start justify-between gap-4">
            <h3 class="font-display text-2xl">${renderText(item.title)}</h3>
            ${renderIcon(item.icon, "w-5 h-5 text-brass shrink-0")}
          </div>
          <p class="text-sm ${style.body} leading-relaxed mt-3">${renderText(item.body)}</p>
        </div>`;
}

export function renderServices(block: ThemeBlock<"services">, context: BlockContext): string {
  const { props } = block;
  const style = getToneStyle(context.tone);
  const list = block.variant === "list";
  const grid = list ? "grid md:grid-cols-2 gap-x-12 gap-y-10" : "grid md:grid-cols-3 gap-12";
  const items = props.items
    .map((item) => (list ? renderListItem(item, style) : renderColumn(item, style)))
    .join("");

  const inner = `
    <div class="max-w-7xl mx-auto">${renderHeader(props.eyebrow, props.title, props.body, style)}
      <div class="${grid}">${items}
      </div>
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
