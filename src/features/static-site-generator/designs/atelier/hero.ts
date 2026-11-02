import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { ThemeBlock } from "../../themes/types";
import { renderAccentTitle, renderButton, renderEyebrow } from "./parts";

function renderCopy(props: ThemeBlock<"hero">["props"]): string {
  const button = props.primary ? `<div class="at-hero-action at-reveal">${renderButton(props.primary)}</div>` : "";

  return `
      ${renderEyebrow(props.eyebrow)}
      <h1 class="at-hero-title at-reveal">${renderAccentTitle(props.title)}</h1>
      <p class="at-hero-body at-reveal">${renderText(props.body)}</p>
      ${button}`;
}

// Split: serif title on the paper, photo with a diagonal cut on the other side.
function renderSplit(block: ThemeBlock<"hero">): string {
  const { props } = block;
  const photo = props.image
    ? `
    <div class="at-hero-photo at-cut">${renderImage(props.image, "")}</div>`
    : "";

  const inner = `
    <div class="at-hero-copy">${renderCopy(props)}
    </div>${photo}`;

  return renderSection(block, `at-hero at-hero-split${props.image ? "" : " at-hero-solo"}`, inner);
}

// Centered: the same words over a full-width photo.
function renderCentered(block: ThemeBlock<"hero">): string {
  const { props } = block;
  const photo = props.image ? renderImage(props.image, "at-hero-bg") : "";

  const inner = `
    ${photo}
    <div class="at-hero-shade" aria-hidden="true"></div>
    <div class="at-hero-copy">${renderCopy(props)}
    </div>`;

  return renderSection(block, "at-hero at-hero-centered", inner);
}

export function renderHero(block: ThemeBlock<"hero">): string {
  return block.design === "atelier/hero-centered" ? renderCentered(block) : renderSplit(block);
}
