import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import {
  renderEyebrow,
  renderHeading,
  renderParagraphs,
  renderRule,
  renderTextLink,
  sectionClasses,
} from "./parts";

function renderPoints(points: string[]): string {
  if (points.length === 0) {
    return "";
  }

  return `
        <ul class="au-points au-reveal">
          ${points.map((point) => `<li>${renderText(point)}</li>`).join("\n          ")}
        </ul>`;
}

// Consecutive sections alternate tone, so the photo alternates sides without a second design.
export function renderFeatureSplit(block: ThemeBlock<"feature-split">, context: BlockContext): string {
  const { props } = block;
  const photoFirst = context.tone === "light";
  const photo = props.image
    ? `
      <div class="au-feature-photo au-zoom au-reveal">${renderImage(props.image, "")}</div>`
    : "";

  const inner = `
    <div class="au-wrap au-feature${photoFirst ? " au-feature-flip" : ""}${props.image ? "" : " au-feature-solo"}">
      <div class="au-text">
        ${renderRule()}
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
        ${renderParagraphs(props.paragraphs)}${renderPoints(props.points)}
        ${renderTextLink(props.link)}
      </div>${photo}
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
