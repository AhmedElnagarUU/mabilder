import { renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import {
  getToneStyle,
  renderEyebrow,
  renderOptionalBody,
  renderSection,
  renderTitle,
  sectionPadding,
} from "../parts";

export function renderTimeline(block: ThemeBlock<"timeline">, context: BlockContext): string {
  const { props } = block;
  const style = getToneStyle(context.tone);

  const inner = `
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20">
      <div class="lg:col-span-4">
        ${renderEyebrow(props.eyebrow)}
        ${renderTitle(props.title)}
        ${renderOptionalBody(props.body, `${style.body} mt-6`)}
      </div>
      <div class="lg:col-span-8 space-y-10">
        ${props.items
          .map(
            (item) => `
        <div class="grid grid-cols-[80px_1fr] gap-6 reveal border-t ${style.border} pt-8">
          <span class="font-display text-3xl text-brass">${renderText(item.year)}</span>
          <div>
            <h3 class="font-medium mb-2">${renderText(item.title)}</h3>
            <p class="text-sm ${style.body} leading-relaxed">${renderText(item.body)}</p>
          </div>
        </div>`,
          )
          .join("")}
      </div>
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
