import type { Image } from "../../blocks/common";
import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderCenteredHead, renderIcon, sectionClasses } from "./parts";

type ServiceItem = ThemeBlock<"services">["props"]["items"][number];

function renderColumn(item: ServiceItem, index: number): string {
  return `
        <div class="au-col au-reveal">
          ${renderIcon(item.icon, index, "au-icon au-icon-lg")}
          <h3 class="au-card-title">${renderText(item.title)}</h3>
          <p class="au-small">${renderText(item.body)}</p>
        </div>`;
}

function renderCircle(item: ServiceItem, index: number): string {
  return `
        <div class="au-circle-item au-reveal">
          <span class="au-circle">${renderIcon(item.icon, index, "au-icon")}</span>
          <h3 class="au-caps-title">${renderText(item.title)}</h3>
          <p class="au-small">${renderText(item.body)}</p>
        </div>`;
}

function renderPhotoPanel(item: ServiceItem, image: Image): string {
  return `
        <article class="au-panel au-reveal">
          ${renderImage(image, "au-panel-photo")}
          <div class="au-panel-text">
            <h3 class="au-card-title">${renderText(item.title)}</h3>
            <p class="au-small">${renderText(item.body)}</p>
          </div>
        </article>`;
}

function renderIconPanel(item: ServiceItem, index: number): string {
  return `
        <article class="au-panel au-panel-plain au-reveal">
          ${renderIcon(item.icon, index, "au-icon au-icon-lg")}
          <div class="au-panel-text">
            <h3 class="au-card-title">${renderText(item.title)}</h3>
            <p class="au-small">${renderText(item.body)}</p>
          </div>
        </article>`;
}

function renderItems(block: ThemeBlock<"services">): { grid: string; items: string } {
  const { items } = block.props;

  if (block.design === "aurelia/services-circles") {
    return { grid: "au-circles", items: items.map(renderCircle).join("") };
  }

  if (block.design === "aurelia/services-panels") {
    const panels = items.map((item, index) =>
      item.image ? renderPhotoPanel(item, item.image) : renderIconPanel(item, index),
    );
    return { grid: "au-panels", items: panels.join("") };
  }

  return { grid: "au-cols", items: items.map(renderColumn).join("") };
}

export function renderServices(block: ThemeBlock<"services">, context: BlockContext): string {
  const { props } = block;
  const { grid, items } = renderItems(block);

  const inner = `
    <div class="au-wrap">${renderCenteredHead(props.eyebrow, props.title, props.body)}
      <div class="au-clip"><div class="${grid}">${items}
      </div></div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
