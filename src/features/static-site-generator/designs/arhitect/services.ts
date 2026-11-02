import type { Image } from "../../blocks/common";
import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderHead, renderIcon, renderIndex, sectionClasses } from "./parts";

type ServiceItem = ThemeBlock<"services">["props"]["items"][number];

// Photo panels across the full width; on focus or hover a panel widens while the others yield.
function renderPhotoPanel(item: ServiceItem, image: Image, index: number): string {
  return `
          <article class="ar-panel">
            ${renderImage(image, "ar-panel-photo ar-photo")}
            <div class="ar-panel-shade" aria-hidden="true"></div>
            <div class="ar-panel-text">
              ${renderIndex(index, "ar-index ar-index-small")}
              <h3 class="ar-caps-title">${renderText(item.title)}</h3>
              <p class="ar-small">${renderText(item.body)}</p>
            </div>
          </article>`;
}

// A service without a photo keeps the rhythm as a flat black panel with a line icon.
function renderIconPanel(item: ServiceItem, index: number): string {
  return `
          <article class="ar-panel ar-panel-plain">
            ${renderIcon(item.icon, index, "ar-icon ar-icon-lg")}
            <div class="ar-panel-text">
              ${renderIndex(index, "ar-index ar-index-small")}
              <h3 class="ar-caps-title">${renderText(item.title)}</h3>
              <p class="ar-small">${renderText(item.body)}</p>
            </div>
          </article>`;
}

function renderPanelRow(item: ServiceItem, index: number): string {
  return item.image ? renderPhotoPanel(item, item.image, index) : renderIconPanel(item, index);
}

// The second design: a numbered table of rows with hairline dividers.
function renderRow(item: ServiceItem, index: number): string {
  return `
          <div class="ar-service-row ar-reveal">
            ${renderIcon(item.icon, index, "ar-icon")}
            <div>
              <h3 class="ar-caps-title">${renderText(item.title)}</h3>
              <p class="ar-small">${renderText(item.body)}</p>
            </div>
            ${renderIndex(index)}
          </div>`;
}

export function renderServices(block: ThemeBlock<"services">, context: BlockContext): string {
  const { props } = block;
  const rows = block.design === "arhitect/services-rows";
  const items = props.items
    .map((item, index) => (rows ? renderRow(item, index) : renderPanelRow(item, index)))
    .join("");

  const grid = rows ? `
      <div class="ar-services-rows">${items}
      </div>` : `
      <div class="ar-panels">${items}
      </div>`;

  const inner = `
    <div class="ar-wrap">${renderHead(props.eyebrow, props.title, props.body)}${grid}
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
