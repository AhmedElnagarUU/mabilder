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

export function renderFaq(block: ThemeBlock<"faq">, context: BlockContext): string {
  const { props } = block;
  const style = getToneStyle(context.tone);

  const inner = `
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
      <div class="lg:col-span-4">
        ${renderEyebrow(props.eyebrow)}
        ${renderTitle(props.title)}
        ${renderOptionalBody(props.body, `${style.body} mt-6`)}
      </div>
      <div class="lg:col-span-8 divide-y ${style.divide} border-t ${style.border}">
        ${props.items
          .map(
            (item) => `
        <details class="faq py-5 reveal">
          <summary class="flex items-center justify-between gap-6">
            <span class="font-display text-xl">${renderText(item.question)}</span>
            <i data-lucide="plus" class="faq-icon w-4 h-4 text-brass shrink-0"></i>
          </summary>
          <p class="text-sm ${style.body} leading-relaxed mt-4 pe-10">${renderText(item.answer)}</p>
        </details>`,
          )
          .join("")}
      </div>
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
