import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderHead, renderIndex, sectionClasses } from "./parts";

// The workplan as a table: one row per step, index number and hairline.
export function renderProcess(block: ThemeBlock<"process">, context: BlockContext): string {
  const { props } = block;

  const steps = props.steps
    .map(
      (step, index) => `
          <li class="ar-step ar-reveal">
            ${renderIndex(index, "ar-index ar-index-row")}
            <div>
              <h3 class="ar-caps-title">${renderText(step.title)}</h3>
              <p class="ar-small">${renderText(step.body)}</p>
            </div>
          </li>`,
    )
    .join("");

  const inner = `
    <div class="ar-wrap">${renderHead(props.eyebrow, props.title, props.body)}
      <ol class="ar-steps">${steps}
      </ol>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
