import type { Stat } from "../../blocks/common";
import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import {
  renderCenteredHead,
  renderEyebrow,
  renderHeading,
  renderIcon,
  renderStatNumber,
  sectionClasses,
} from "./parts";

function renderBandItem(item: Stat): string {
  return `
        <div class="au-stat">
          ${renderStatNumber(item.value, "au-num-md")}
          <p class="au-caps">${renderText(item.label)}</p>
        </div>`;
}

function renderBand(block: ThemeBlock<"stats">): string {
  const { props } = block;

  return `
    <div class="au-wrap">${renderCenteredHead(props.eyebrow, props.title, undefined)}
      <div class="au-clip"><div class="au-stat-row au-reveal">${props.items.map(renderBandItem).join("")}
      </div></div>
    </div>`;
}

function renderIconStat(item: Stat, index: number): string {
  return `
          <div class="au-icon-stat au-reveal">
            <span class="au-circle au-circle-sm">${renderIcon(undefined, index + 3, "au-icon")}</span>
            <div>
              ${renderStatNumber(item.value, "au-num-sm")}
              <p class="au-caps">${renderText(item.label)}</p>
            </div>
          </div>`;
}

// First stat huge on one side, the rest as icon stats beside it.
function renderBigNumber(block: ThemeBlock<"stats">): string {
  const { props } = block;
  const [first, ...rest] = props.items;

  return `
    <div class="au-wrap au-big">
      <div class="au-big-lead">
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
        <div class="au-reveal">
          ${renderStatNumber(first.value, "au-num-xl")}
          <p class="au-caps">${renderText(first.label)}</p>
        </div>
      </div>
      <div class="au-icon-stats">${rest.map(renderIconStat).join("")}
      </div>
    </div>`;
}

export function renderStats(block: ThemeBlock<"stats">, context: BlockContext): string {
  const bigNumber = block.design === "aurelia/stats-big-number";
  const inner = bigNumber ? renderBigNumber(block) : renderBand(block);
  const classes = sectionClasses(context.tone, bigNumber ? "au-stats" : "au-stats au-stats-band");

  return renderSection(block, classes, inner);
}
