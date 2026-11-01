import { renderText } from "../../content/html";
import { renderSection, stepNumber } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderCenteredHead, sectionClasses } from "./parts";

export function renderProcess(block: ThemeBlock<"process">, context: BlockContext): string {
  const { props } = block;

  const steps = props.steps
    .map(
      (step, index) => `
        <li class="au-step au-reveal">
          <span class="au-step-number">${stepNumber(index)}</span>
          <h3 class="au-card-title">${renderText(step.title)}</h3>
          <p class="au-small">${renderText(step.body)}</p>
        </li>`,
    )
    .join("");

  const inner = `
    <div class="au-wrap">${renderCenteredHead(props.eyebrow, props.title, props.body)}
      <ol class="au-steps">${steps}
      </ol>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
