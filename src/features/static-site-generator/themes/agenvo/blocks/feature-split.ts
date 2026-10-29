import { renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import {
  getToneStyle,
  renderEyebrow,
  renderImage,
  renderParagraphs,
  renderSection,
  renderTextLink,
  renderTitle,
  sectionPadding,
} from "../parts";

function renderPoints(points: string[], bodyClass: string): string {
  if (points.length === 0) {
    return "";
  }

  return `
        <ul class="mt-8 space-y-3 text-sm ${bodyClass} reveal">
          ${points
            .map(
              (point) =>
                `<li class="flex gap-3"><i data-lucide="check" class="w-4 h-4 text-brass shrink-0 mt-0.5"></i> ${renderText(point)}</li>`,
            )
            .join("\n          ")}
        </ul>`;
}

export function renderFeatureSplit(
  block: ThemeBlock<"feature-split">,
  context: BlockContext,
): string {
  const { props } = block;
  const style = getToneStyle(context.tone);
  const imageFirst = block.variant === "image-left";

  const text = `
      <div class="lg:col-span-5${imageFirst ? " lg:order-2" : ""}">
        ${renderEyebrow(props.eyebrow)}
        ${renderTitle(props.title)}
        ${renderParagraphs(props.paragraphs, `${style.body} text-sm mt-6`)}
        ${renderPoints(props.points, style.body)}
        ${renderTextLink(props.link)}
      </div>`;

  const image = props.image
    ? `
      <div class="lg:col-span-7${imageFirst ? " lg:order-1" : ""} img-zoom overflow-hidden reveal">
        ${renderImage(props.image, "w-full h-80 md:h-[460px] object-cover")}
      </div>`
    : "";

  const inner = `
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">${text}${image}
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding} scroll-mt-20`, inner);
}
