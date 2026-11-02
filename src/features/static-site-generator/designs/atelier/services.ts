import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading, renderIcon, renderOptionalBody, renderSideLabel, sectionClasses } from "./parts";

type ServiceItem = ThemeBlock<"services">["props"]["items"][number];

function renderColumn(item: ServiceItem, index: number): string {
  return `
        <div class="at-col at-reveal">
          ${renderIcon(item.icon, index, "at-icon")}
          <h3 class="at-card-title">${renderText(item.title)}</h3>
          <p class="at-small">${renderText(item.body)}</p>
        </div>`;
}

function renderListItem(item: ServiceItem): string {
  return `
        <li class="at-dash-item at-reveal">
          <h3 class="at-card-title">${renderText(item.title)}</h3>
          <p class="at-small">${renderText(item.body)}</p>
        </li>`;
}

export function renderServices(block: ThemeBlock<"services">, context: BlockContext): string {
  const { props } = block;
  const list = block.design === "atelier/services-list";

  const items = list
    ? `<ul class="at-dash">${props.items.map(renderListItem).join("")}
      </ul>`
    : `<div class="at-cols">${props.items.map(renderColumn).join("")}
      </div>`;

  const inner = `
    <div class="at-wrap${props.eyebrow ? " at-with-label" : ""}">
      ${renderSideLabel(props.eyebrow)}
      <div class="at-main">
        <header class="at-head at-head-start">
          ${renderEyebrow(props.eyebrow)}
          ${renderHeading(props.title)}
          ${renderOptionalBody(props.body)}
        </header>
        ${items}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
