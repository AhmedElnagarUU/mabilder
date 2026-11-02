import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderHead, sectionClasses } from "./parts";

export function renderFaq(block: ThemeBlock<"faq">, context: BlockContext): string {
  const { props } = block;

  const items = props.items
    .map(
      (item) => `
        <details class="at-faq at-reveal">
          <summary><span>${renderText(item.question)}</span><span class="at-plus" aria-hidden="true"></span></summary>
          <p class="at-small">${renderText(item.answer)}</p>
        </details>`,
    )
    .join("");

  const inner = `
    <div class="at-wrap at-narrow">${renderHead(props.eyebrow, props.title, props.body)}
      <div class="at-faqs">${items}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
