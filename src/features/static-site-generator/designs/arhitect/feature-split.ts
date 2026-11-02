import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import {
  renderEyebrow,
  renderHeading,
  renderParagraphs,
  renderTextLink,
  sectionClasses,
} from "./parts";

function renderPoints(points: string[]): string {
  if (points.length === 0) {
    return "";
  }

  return `
          <ul class="ar-points ar-reveal">
            ${points.map((point) => `<li>${renderText(point)}</li>`).join("\n            ")}
          </ul>`;
}

// Text on one side, a grayscale photo on the other; the tone rhythm swaps the sides.
export function renderFeatureSplit(block: ThemeBlock<"feature-split">, context: BlockContext): string {
  const { props } = block;
  const photoFirst = context.tone === "light";
  const photo = props.image
    ? `
          <div class="ar-item-cover ar-feature-photo ar-reveal">${renderImage(props.image, "ar-img-cover ar-photo")}</div>`
    : "";

  const inner = `
    <div class="ar-wrap ar-feature${photoFirst ? " ar-feature-flip" : ""}${props.image ? "" : " ar-feature-solo"}">
      <div class="ar-text">
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
        ${renderParagraphs(props.paragraphs)}${renderPoints(props.points)}
        ${renderTextLink(props.link)}
      </div>${photo}
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
