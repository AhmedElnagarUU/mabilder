import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading, renderParagraphs, renderSideLabel, renderTextLink, sectionClasses } from "./parts";

function renderPhotos(images: ThemeBlock<"intro">["props"]["images"]): string {
  if (images.length === 0) {
    return "";
  }

  return `
      <div class="at-collage at-collage-${Math.min(images.length, 3)} at-reveal">
        ${images.map((image) => `<div class="at-collage-item at-cover">${renderImage(image, "")}</div>`).join("\n        ")}
      </div>`;
}

export function renderIntro(block: ThemeBlock<"intro">, context: BlockContext): string {
  const { props } = block;
  const quote = props.quote ? `<p class="at-lead at-reveal">${renderText(props.quote)}</p>` : "";
  const split = props.images.length > 0 ? " at-split" : "";

  const inner = `
    <div class="at-wrap${props.eyebrow ? " at-with-label" : ""}${split}">
      ${renderSideLabel(props.eyebrow)}
      <div class="at-text">
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
        ${quote}
        ${renderParagraphs(props.paragraphs)}
        ${renderTextLink(props.link)}
      </div>${renderPhotos(props.images)}
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
