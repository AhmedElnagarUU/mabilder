import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderCenteredHead, sectionClasses } from "./parts";

export function renderFaq(block: ThemeBlock<"faq">, context: BlockContext): string {
  const { props } = block;

  const items = props.items
    .map(
      (item) => `
        <details class="au-faq au-reveal">
          <summary><span>${renderText(item.question)}</span><span class="au-plus" aria-hidden="true"></span></summary>
          <p class="au-small">${renderText(item.answer)}</p>
        </details>`,
    )
    .join("");

  const inner = `
    <div class="au-wrap au-narrow">${renderCenteredHead(props.eyebrow, props.title, props.body)}
      <div class="au-faqs">${items}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
