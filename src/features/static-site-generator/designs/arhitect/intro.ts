import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading, renderParagraphs, renderTextLink } from "./parts";

// The white "about" band. Pure black pages get one bright, centered pause.
export function renderIntro(block: ThemeBlock<"intro">): string {
  const { props } = block;
  const quote = props.quote ? `<p class="ar-lead ar-reveal">${renderText(props.quote)}</p>` : "";
  const photos =
    props.images.length === 0
      ? ""
      : `<div class="ar-intro-photos ar-reveal">${props.images
          .map((image) => `<div class="ar-item-cover">${renderImage(image, "ar-img-cover ar-photo")}</div>`)
          .join("")}
        </div>`;

  const inner = `
    <div class="ar-wrap ar-narrow ar-center">
      <span class="ar-rule ar-rule-center" aria-hidden="true"></span>
      ${renderEyebrow(props.eyebrow)}
      ${renderHeading(props.title)}
      ${quote}
      ${renderParagraphs(props.paragraphs)}
      <div class="ar-center-link">${renderTextLink(props.link)}</div>
      ${photos}
    </div>`;

  return renderSection(block, "ar-sec ar-invert", inner);
}
