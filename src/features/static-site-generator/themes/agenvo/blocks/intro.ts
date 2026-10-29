import type { Image } from "../../../blocks/common";
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
  type ToneStyle,
} from "../parts";

const collageClasses = ["", " mt-8", " col-span-2"];

function renderCollage(images: Image[]): string {
  if (images.length === 0) {
    return "";
  }

  return `
      <div class="grid grid-cols-2 gap-4 reveal">
        ${images
          .map((image, index) =>
            renderImage(image, `rounded-sm w-full h-48 object-cover${collageClasses[index] ?? ""}`),
          )
          .join("\n        ")}
      </div>`;
}

function renderImagesVariant(block: ThemeBlock<"intro">, style: ToneStyle): string {
  const { props } = block;
  const columns = props.images.length > 0 ? "lg:grid-cols-2" : "";

  return `
    <div class="max-w-7xl mx-auto grid ${columns} gap-16 items-center">
      <div class="max-w-2xl">
        <div class="h-px bg-brass line-draw mb-6" data-line></div>
        ${renderEyebrow(props.eyebrow)}
        ${renderTitle(props.title)}
        ${props.quote ? `<p class="font-display text-2xl leading-snug mt-6 reveal">${renderText(props.quote)}</p>` : ""}
        ${renderParagraphs(props.paragraphs, `${style.body} mt-4`)}
        ${renderTextLink(props.link)}
      </div>${renderCollage(props.images)}
    </div>`;
}

function renderQuoteVariant(block: ThemeBlock<"intro">, style: ToneStyle): string {
  const { props } = block;
  const image = props.images[0];

  return `
    <div class="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20">
      <div class="lg:col-span-4">
        <div class="h-px bg-brass line-draw mb-6" data-line></div>
        ${renderEyebrow(props.eyebrow)}
        ${renderTitle(props.title, "text-4xl md:text-5xl leading-[1.05]")}
        ${image ? `<div class="mt-8 aspect-[4/5] overflow-hidden img-zoom reveal">${renderImage(image, "w-full h-full object-cover")}</div>` : ""}
      </div>
      <div class="lg:col-span-8 lg:pt-16">
        ${props.quote ? `<p class="font-display text-2xl md:text-3xl leading-snug reveal">${renderText(props.quote)}</p>` : ""}
        <div class="grid md:grid-cols-2 gap-8 mt-10 text-sm">
          ${renderParagraphs(props.paragraphs, style.body)}
        </div>
        ${renderTextLink(props.link)}
      </div>
    </div>`;
}

export function renderIntro(block: ThemeBlock<"intro">, context: BlockContext): string {
  const style = getToneStyle(context.tone);
  const inner =
    block.variant === "quote"
      ? renderQuoteVariant(block, style)
      : renderImagesVariant(block, style);

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
