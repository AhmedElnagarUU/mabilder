import type { Stat } from "../../blocks/common";
import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading, renderStatNumber, sectionClasses } from "./parts";

function renderStat(item: Stat): string {
  return `
        <div class="at-stat at-reveal">
          ${renderStatNumber(item.value, "at-num-md")}
          <p class="at-caps">${renderText(item.label)}</p>
        </div>`;
}

// Row: a thin band of numbers between two hairlines, the title above it.
function renderRow(block: ThemeBlock<"stats">): string {
  const { props } = block;

  return `
    <div class="at-wrap">
      <header class="at-head at-head-start">
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
      </header>
      <div class="at-stat-row">${props.items.map(renderStat).join("")}
      </div>
    </div>`;
}

// Aside: the title on one side, the numbers stacked in two columns on the other.
function renderAside(block: ThemeBlock<"stats">): string {
  const { props } = block;

  return `
    <div class="at-wrap at-aside">
      <header class="at-head at-head-start">
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
      </header>
      <div class="at-stat-grid">${props.items.map(renderStat).join("")}
      </div>
    </div>`;
}

export function renderStats(block: ThemeBlock<"stats">, context: BlockContext): string {
  const aside = block.design === "atelier/stats-aside";

  return renderSection(block, sectionClasses(context.tone, "at-stats"), aside ? renderAside(block) : renderRow(block));
}
