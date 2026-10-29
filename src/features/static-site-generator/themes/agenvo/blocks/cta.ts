import { renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock, Tone } from "../../types";
import { getToneStyle, renderButton, renderSection } from "../parts";

type CtaVariant = ThemeBlock<"cta">["variant"];

type PanelStyle = {
  panel: string;
  body: string;
  primary: string;
  secondary: string;
};

const darkPanel = {
  body: "text-white/50",
  primary: "bg-brass text-charcoal hover:bg-cream",
  secondary: "border border-white/20 hover:border-brass hover:text-brass",
};

const lightPanel = {
  body: "text-gray-600",
  primary: "bg-charcoal text-cream hover:bg-brass hover:text-charcoal",
  secondary: "border border-charcoal/20 hover:border-brass hover:text-brass",
};

const panelStyles: Record<CtaVariant, Record<Tone, PanelStyle>> = {
  dark: {
    light: { ...darkPanel, panel: "bg-charcoal text-cream" },
    dark: { ...darkPanel, panel: "bg-white/5 text-cream border border-white/10" },
  },
  light: {
    light: { ...lightPanel, panel: "bg-sand/70 text-charcoal" },
    dark: { ...lightPanel, panel: "bg-cream text-charcoal" },
  },
};

export function renderCta(block: ThemeBlock<"cta">, context: BlockContext): string {
  const { props } = block;
  const style = getToneStyle(context.tone);
  const panel = panelStyles[block.variant][context.tone];

  const inner = `
    <div class="max-w-7xl mx-auto ${panel.panel} px-8 py-16 md:px-16 md:py-20 grid lg:grid-cols-2 gap-10 items-center reveal">
      <div>
        ${props.eyebrow ? `<p class="text-[11px] uppercase tracking-[0.3em] text-brass mb-4">${renderText(props.eyebrow)}</p>` : ""}
        <h2 class="font-display text-4xl md:text-5xl leading-tight">${renderText(props.title)}</h2>
      </div>
      <div class="lg:justify-self-end">
        <p class="text-sm ${panel.body} leading-relaxed mb-6 max-w-sm">${renderText(props.body)}</p>
        <div class="flex flex-wrap gap-3">
          ${renderButton(props.primary, panel.primary)}
          ${props.secondary ? renderButton(props.secondary, panel.secondary) : ""}
        </div>
      </div>
    </div>`;

  return renderSection(block, `${style.section} py-24 px-6 md:px-10 lg:px-16`, inner);
}
