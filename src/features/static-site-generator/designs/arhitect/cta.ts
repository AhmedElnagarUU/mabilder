import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { ThemeBlock } from "../../themes/types";
import { renderButton, renderEyebrow } from "./parts";

// The call to action is a full-width signal-red bar with uppercase type.
export function renderCta(block: ThemeBlock<"cta">): string {
  const { props } = block;
  const secondary = props.secondary ? renderButton(props.secondary, "outline") : "";

  const inner = `
    <div class="ar-wrap">
      ${renderEyebrow(props.eyebrow)}
      <h2 class="ar-title ar-reveal">${renderText(props.title)}</h2>
      <p class="ar-body ar-reveal">${renderText(props.body)}</p>
      <div class="ar-actions">
        ${renderButton(props.primary, "solid")}
        ${secondary}
      </div>
    </div>`;

  return renderSection(block, "ar-sec ar-cta", `${inner}`);
}
