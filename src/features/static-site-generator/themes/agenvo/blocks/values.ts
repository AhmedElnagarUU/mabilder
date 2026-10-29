import { renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import {
  getToneStyle,
  renderHeader,
  renderSection,
  sectionPadding,
  stepNumber,
} from "../parts";

export function renderValues(block: ThemeBlock<"values">, context: BlockContext): string {
  const { props } = block;
  const style = getToneStyle(context.tone);

  const inner = `
    <div class="max-w-7xl mx-auto">${renderHeader(props.eyebrow, props.title, props.body, style)}
      <div class="grid md:grid-cols-2 gap-x-16 gap-y-12">
        ${props.items
          .map(
            (item, index) => `
        <div class="reveal border-t ${style.border} pt-6">
          <div class="flex items-baseline gap-4">
            <span class="font-display text-2xl text-brass/60">${stepNumber(index)}</span>
            <h3 class="font-display text-2xl">${renderText(item.title)}</h3>
          </div>
          <p class="text-sm ${style.body} leading-relaxed mt-4">${renderText(item.body)}</p>
        </div>`,
          )
          .join("")}
      </div>
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
