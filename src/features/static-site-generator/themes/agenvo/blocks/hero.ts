import { renderText } from "../../../content/html";
import type { ThemeBlock } from "../../types";
import { renderButton, renderImage, renderSection } from "../parts";

const heights: Record<ThemeBlock<"hero">["variant"], string> = {
  "full-image": "h-screen min-h-[600px]",
  page: "min-h-[72vh]",
  "text-only": "min-h-[56vh]",
};

function renderBackground(block: ThemeBlock<"hero">): string {
  const image = block.props.image;

  if (block.variant === "text-only" || !image) {
    return "";
  }

  const opacity = block.variant === "page" ? " opacity-55" : "";

  return `
    ${renderImage(image, `absolute inset-0 w-full h-full object-cover${opacity}`)}
    <div class="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-charcoal/20"></div>`;
}

export function renderHero(block: ThemeBlock<"hero">): string {
  const { props } = block;

  const inner = `${renderBackground(block)}
    <div class="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 lg:px-16 pt-36 pb-16 lg:pb-24">
      ${props.eyebrow ? `<p class="text-white/60 text-[11px] uppercase tracking-[0.3em] mb-5 reveal">${renderText(props.eyebrow)}</p>` : ""}
      <h1 class="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] max-w-4xl reveal">${renderText(props.title)}</h1>
      <p class="text-white/60 mt-7 max-w-xl text-sm leading-relaxed reveal">${renderText(props.body)}</p>
      ${props.primary ? `<div class="mt-10 reveal">${renderButton(props.primary, "bg-brass text-charcoal hover:bg-cream")}</div>` : ""}
    </div>`;

  return renderSection(
    block,
    `relative ${heights[block.variant]} flex items-end bg-charcoal text-cream`,
    inner,
  );
}
