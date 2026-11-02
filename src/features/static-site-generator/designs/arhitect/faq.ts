import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderHead, sectionClasses } from "./parts";

export function renderFaq(block: ThemeBlock<"faq">, context: BlockContext): string {
  const { props } = block;

  const items = props.items
    .map(
      (item) => `
          <details class="ar-faq ar-reveal">
            <summary><span>${renderText(item.question)}</span><span class="ar-plus" aria-hidden="true"></span></summary>
            <p class="ar-small">${renderText(item.answer)}</p>
          </details>`,
    )
    .join("");

  const inner = `
    <div class="ar-wrap ar-narrow">${renderHead(props.eyebrow, props.title, props.body)}
      <div class="ar-faqs">${items}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
