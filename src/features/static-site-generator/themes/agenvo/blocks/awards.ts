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

export function renderAwards(block: ThemeBlock<"awards">, context: BlockContext): string {
  const { props } = block;
  const style = getToneStyle(context.tone);

  const inner = `
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
      <div class="lg:col-span-4">
        ${renderEyebrow(props.eyebrow)}
        ${renderTitle(props.title, "text-4xl leading-tight")}
        ${renderOptionalBody(props.body, `${style.body} mt-6`)}
      </div>
      <div class="lg:col-span-8 divide-y ${style.divide} border-t ${style.border}">
        ${props.items
          .map(
            (award) => `
        <div class="flex items-center justify-between gap-6 py-5 reveal">
          <div class="flex items-baseline gap-6"><span class="text-[11px] text-brass tracking-widest">${renderText(award.year)}</span><p class="text-sm">${renderText(award.title)}</p></div>
          <i data-lucide="award" class="w-4 h-4 ${style.muted} shrink-0"></i>
        </div>`,
          )
          .join("")}
      </div>
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
