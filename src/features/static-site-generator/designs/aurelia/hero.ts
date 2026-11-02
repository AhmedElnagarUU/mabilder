import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { ThemeBlock } from "../../themes/types";
import { renderAccentTitle, renderButton } from "./parts";

function renderBackground(block: ThemeBlock<"hero">): string {
  const image = block.props.image;
  const photo = image ? renderImage(image, "au-hero-photo") : "";

  return `${photo}
    <div class="au-hero-shade" aria-hidden="true"></div>
    <div class="au-pattern" aria-hidden="true"></div>`;
}

export function renderHero(block: ThemeBlock<"hero">): string {
  const { props } = block;
  const page = block.design === "aurelia/hero-page";
  const eyebrow = props.eyebrow ? `<p class="au-eyebrow au-reveal">${renderText(props.eyebrow)}</p>` : "";
  const button = props.primary ? `<div class="au-hero-action au-reveal">${renderButton(props.primary)}</div>` : "";

  const inner = `${renderBackground(block)}
    <div class="au-hero-inner">
      ${eyebrow}
      <h1 class="au-hero-title au-reveal">${renderAccentTitle(props.title)}</h1>
      <p class="au-hero-body au-reveal">${renderText(props.body)}</p>
      ${button}
    </div>`;

  return renderSection(block, `au-hero${page ? " au-hero-page" : ""}`, inner);
}
