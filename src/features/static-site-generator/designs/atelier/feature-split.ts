import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading, renderParagraphs, renderTextLink, sectionClasses } from "./parts";

function renderPoints(points: string[]): string {
  if (points.length === 0) {
    return "";
  }

  return `
        <ul class="at-dash at-points at-reveal">
          ${points.map((point) => `<li class="at-dash-item">${renderText(point)}</li>`).join("\n          ")}
        </ul>`;
}

// Consecutive sections alternate tone, so the photo alternates sides without a second design.
export function renderFeatureSplit(block: ThemeBlock<"feature-split">, context: BlockContext): string {
  const { props } = block;
  const flip = context.tone === "dark";
  const photo = props.image
    ? `
      <div class="at-feature-photo at-cover at-reveal">${renderImage(props.image, "")}</div>`
    : "";

  const inner = `
    <div class="at-wrap at-feature${flip ? " at-feature-flip" : ""}${props.image ? "" : " at-feature-solo"}">
      <div class="at-text">
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
        ${renderParagraphs(props.paragraphs)}${renderPoints(props.points)}
        ${renderTextLink(props.link)}
      </div>${photo}
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
