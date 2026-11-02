import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { ThemeBlock } from "../../themes/types";
import { renderButton } from "./parts";

// Full-bleed photo with the title at the bottom start and the tagline at the bottom end.
function renderFullHero(block: ThemeBlock<"hero">): string {
  const { props } = block;
  const photo = props.image
    ? `${renderImage(props.image, "ar-hero-photo")}
      <div class="ar-hero-shade" aria-hidden="true"></div>`
    : "";
  const eyebrow = props.eyebrow ? `<p class="ar-hero-eyebrow ar-reveal">${renderText(props.eyebrow)}</p>` : "";
  const button = props.primary
    ? `<div class="ar-hero-action ar-reveal">${renderButton(props.primary, "solid")}</div>`
    : "";

  return `${photo}
      <div class="ar-hero-grid">
        <div class="ar-hero-block">
          ${eyebrow}
          <h1 class="ar-hero-title ar-reveal">${renderText(props.title)}</h1>
          ${button}
        </div>
        <p class="ar-hero-tagline ar-reveal">${renderText(props.body)}</p>
      </div>`;
}

// Text on black beside a full-height photo: the split of one hero in two halves.
function renderSplitHero(block: ThemeBlock<"hero">): string {
  const { props } = block;
  const eyebrow = props.eyebrow ? `<p class="ar-hero-eyebrow ar-reveal">${renderText(props.eyebrow)}</p>` : "";
  const photo = props.image
    ? `<div class="ar-hero-photo-side">${renderImage(props.image, "ar-img-cover ar-photo")}</div>`
    : "";
  const button = props.primary ? `<div class="ar-hero-action ar-reveal">${renderButton(props.primary, "solid")}</div>` : "";

  return `
      <div class="ar-hero-text">
        ${eyebrow}
        <h1 class="ar-hero-title ar-reveal">${renderText(props.title)}</h1>
        <p class="ar-hero-body ar-reveal">${renderText(props.body)}</p>
        ${button}
      </div>${photo}`;
}

export function renderHero(block: ThemeBlock<"hero">): string {
  const split = block.design === "arhitect/hero-split";

  return renderSection(
    block,
    `ar-hero${split ? " ar-hero-split" : ""}`,
    split ? renderSplitHero(block) : renderFullHero(block),
  );
}
