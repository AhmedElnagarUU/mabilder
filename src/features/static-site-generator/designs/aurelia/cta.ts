import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderButton, renderEyebrow, sectionClasses } from "./parts";

export function renderCta(block: ThemeBlock<"cta">, context: BlockContext): string {
  const { props } = block;
  const secondary = props.secondary ? renderButton(props.secondary, "outline") : "";

  const inner = `
    <div class="au-wrap">
      <div class="au-cta au-reveal">
        <div class="au-pattern" aria-hidden="true"></div>
        <div class="au-cta-inner">
          ${renderEyebrow(props.eyebrow)}
          <h2 class="au-title">${renderText(props.title)}</h2>
          <p class="au-body">${renderText(props.body)}</p>
          <div class="au-actions">
            ${renderButton(props.primary, "solid")}
            ${secondary}
          </div>
        </div>
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
