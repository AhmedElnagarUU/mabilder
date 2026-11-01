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

function renderPhotos(images: ThemeBlock<"intro">["props"]["images"]): string {
  if (images.length === 0) {
    return "";
  }

  return `
      <div class="au-collage au-collage-${images.length} au-reveal">
        ${images.map((image) => `<div class="au-collage-item au-zoom">${renderImage(image, "")}</div>`).join("\n        ")}
      </div>`;
}

export function renderIntro(block: ThemeBlock<"intro">, context: BlockContext): string {
  const { props } = block;
  const quote = props.quote ? `<p class="au-lead au-reveal">${renderText(props.quote)}</p>` : "";
  const split = props.images.length > 0 ? " au-split" : "";

  const inner = `
    <div class="au-wrap${split}">
      <div class="au-text">
        ${renderRule()}
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
        ${quote}
        ${renderParagraphs(props.paragraphs)}
        ${renderTextLink(props.link)}
      </div>${renderPhotos(props.images)}
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
