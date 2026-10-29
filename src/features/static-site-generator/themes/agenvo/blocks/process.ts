import { renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import {
  getToneStyle,
  renderHeader,
  renderSection,
  sectionPadding,
  stepNumber,
} from "../parts";

export function renderProcess(block: ThemeBlock<"process">, context: BlockContext): string {
  const { props } = block;
  const style = getToneStyle(context.tone);

  const inner = `
    <div class="max-w-7xl mx-auto">${renderHeader(props.eyebrow, props.title, props.body, style)}
      <div class="grid md:grid-cols-2 lg:grid-cols-${props.steps.length > 4 ? "3" : "4"} gap-8">
        ${props.steps
          .map(
            (step, index) => `
        <div class="border-t ${style.border} pt-6 reveal">
          <span class="font-display text-4xl text-brass/50">${stepNumber(index)}</span>
          <h3 class="font-medium mt-3">${renderText(step.title)}</h3>
          <p class="text-sm ${style.body} leading-relaxed mt-2">${renderText(step.body)}</p>
        </div>`,
          )
          .join("")}
      </div>
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
