import type { Stat } from "../../blocks/common";
import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderHead, renderEyebrow, renderStatNumber, sectionClasses } from "./parts";

function renderDividedItem(item: Stat): string {
  return `
          <div class="ar-stat ar-reveal">
            ${renderStatNumber(item.value, "ar-num-md")}
            <p class="ar-caps">${renderText(item.label)}</p>
          </div>`;
}

// Huge numbers separated by vertical hairlines.
function renderDivided(block: ThemeBlock<"stats">): string {
  const { props } = block;

  return `
    <div class="ar-wrap">${renderHead(props.eyebrow, props.title, undefined)}
      <div class="ar-stat-row">${props.items.map(renderDividedItem).join("")}
      </div>
    </div>`;
}

// The first number becomes one giant statement; the rest line up beneath it.
function renderGiant(block: ThemeBlock<"stats">): string {
  const { props } = block;
  const [first, ...rest] = props.items;

  return `
    <div class="ar-wrap">
      ${renderEyebrow(props.eyebrow)}
      ${renderStatNumber(first.value, "ar-num-xl")}
      <p class="ar-caps ar-giant-label">${renderText(first.label)}</p>
      <h2 class="ar-title ar-title-sm ar-reveal">${renderText(props.title)}</h2>
      ${rest
        .map(
          (item) => `
      <div class="ar-stat-giant ar-reveal">
        <div>${renderStatNumber(item.value, "ar-num-md")}
        </div>
        <p class="ar-caps ar-giant-label">${renderText(item.label)}</p>
      </div>`,
        )
        .join("")}
    </div>`;
}

export function renderStats(block: ThemeBlock<"stats">, context: BlockContext): string {
  const giant = block.design === "arhitect/stats-giant";
  const inner = giant ? renderGiant(block) : renderDivided(block);

  return renderSection(block, sectionClasses(context.tone, "ar-stats"), inner);
}
