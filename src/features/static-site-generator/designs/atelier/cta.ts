import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderAccentTitle, renderButton, renderEyebrow, sectionClasses } from "./parts";

// Quiet: one line of words between hairlines and an underlined link.
export function renderCta(block: ThemeBlock<"cta">, context: BlockContext): string {
  const { props } = block;
  const secondary = props.secondary ? renderButton(props.secondary, "line") : "";

  const inner = `
    <div class="at-wrap at-cta at-reveal">
      <div class="at-cta-text">
        ${renderEyebrow(props.eyebrow)}
        <h2 class="at-title">${renderAccentTitle(props.title)}</h2>
        <p class="at-body">${renderText(props.body)}</p>
      </div>
      <div class="at-actions">
        ${renderButton(props.primary, "solid")}
        ${secondary}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone, "at-sec-tight"), inner);
}
