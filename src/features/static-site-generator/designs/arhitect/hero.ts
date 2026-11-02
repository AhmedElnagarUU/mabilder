import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { ThemeBlock } from "../../themes/types";
import { renderButton } from "./parts";

// Full-viewport photo behind everything: the title sits mid-left, the tagline mid-right and
// the button at the bottom; all fade in on load. JavaScript moves the photo slower than the scroll.
function renderFullHero(block: ThemeBlock<"hero">): string {
  const { props } = block;
  const photo = props.image
    ? `<div class="ar-hero-bg" data-parallax>
        ${renderImage(props.image, "ar-hero-photo")}
        <div class="ar-hero-shade" aria-hidden="true"></div>
      </div>`
    : "";
  const eyebrow = props.eyebrow ? `<p class="ar-hero-eyebrow ar-fade">${renderText(props.eyebrow)}</p>` : "";
  const button = props.primary
    ? `<div class="ar-hero-action ar-fade ar-fade-3">${renderButton(props.primary)}</div>`
    : "";

  return `${photo}
      <div class="ar-hero-grid">
        <div class="ar-hero-block">
          ${eyebrow}
          <h1 class="ar-hero-title ar-fade">${renderText(props.title)}</h1>
        </div>
        <p class="ar-hero-tagline ar-fade ar-fade-2">${renderText(props.body)}</p>
      </div>${button}`;
}

// Text on black beside a full-height photo: the split of one hero in two halves.
function renderSplitHero(block: ThemeBlock<"hero">): string {
  const { props } = block;
  const eyebrow = props.eyebrow ? `<p class="ar-hero-eyebrow ar-reveal">${renderText(props.eyebrow)}</p>` : "";
  const photo = props.image
    ? `<div class="ar-hero-photo-side">${renderImage(props.image, "ar-img-cover ar-photo")}</div>`
    : "";
  const button = props.primary ? `<div class="ar-hero-action ar-reveal">${renderButton(props.primary)}</div>` : "";

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
