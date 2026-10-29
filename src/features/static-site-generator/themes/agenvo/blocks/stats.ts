import type { Stat } from "../../../blocks/common";
import { renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import {
  getToneStyle,
  renderCounter,
  renderEyebrow,
  renderSection,
  renderTitle,
  sectionPadding,
  type ToneStyle,
} from "../parts";

const bandColumns: Record<number, string> = {
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
};

function renderBand(block: ThemeBlock<"stats">, style: ToneStyle): string {
  const { props } = block;

  return `
    <div class="max-w-7xl mx-auto">
      <div class="text-center mb-12">
        ${renderEyebrow(props.eyebrow)}
        ${renderTitle(props.title)}
      </div>
      <div class="grid grid-cols-2 ${bandColumns[props.items.length] ?? "md:grid-cols-4"} border-t ${style.border} divide-x rtl:divide-x-reverse ${style.divide}">
        ${props.items.map((item) => renderBandItem(item, style)).join("")}
      </div>
    </div>`;
}

function renderBandItem(item: Stat, style: ToneStyle): string {
  return `
        <div class="py-10 px-8 text-center reveal">
          ${renderCounter(item.value, "text-4xl md:text-5xl")}
          <div class="text-xs uppercase tracking-widest ${style.muted} mt-2">${renderText(item.label)}</div>
        </div>`;
}

function renderSplit(block: ThemeBlock<"stats">, style: ToneStyle): string {
  const { props } = block;

  return `
    <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
      <div>
        ${renderEyebrow(props.eyebrow)}
        ${renderTitle(props.title)}
      </div>
      <div class="grid grid-cols-2 gap-x-8 gap-y-10">
        ${props.items
          .map(
            (item) => `
        <div class="reveal">
          ${renderCounter(item.value, "text-5xl")}
          <p class="text-[10px] uppercase tracking-[0.18em] ${style.muted} mt-2">${renderText(item.label)}</p>
        </div>`,
          )
          .join("")}
      </div>
    </div>`;
}

export function renderStats(block: ThemeBlock<"stats">, context: BlockContext): string {
  const style = getToneStyle(context.tone);
  const inner = block.variant === "dark" ? renderBand(block, style) : renderSplit(block, style);

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
