import { renderText } from "../../content/html";
import { renderSection, stepNumber } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderHead, sectionClasses } from "./parts";

// Steps hang on one horizontal hairline, each marked by a dot.
export function renderProcess(block: ThemeBlock<"process">, context: BlockContext): string {
  const { props } = block;

  const steps = props.steps
    .map(
      (step, index) => `
        <li class="at-step at-reveal">
          <span class="at-dot" aria-hidden="true"></span>
          <span class="at-step-number">${stepNumber(index)}</span>
          <h3 class="at-card-title">${renderText(step.title)}</h3>
          <p class="at-small">${renderText(step.body)}</p>
        </li>`,
    )
    .join("");

  const inner = `
    <div class="at-wrap">${renderHead(props.eyebrow, props.title, props.body)}
      <ol class="at-steps">${steps}
      </ol>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
