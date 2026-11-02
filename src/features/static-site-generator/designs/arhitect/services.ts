import type { Image } from "../../blocks/common";
import { renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderHead, renderIcon, renderIndex, sectionClasses } from "./parts";

type ServiceItem = ThemeBlock<"services">["props"]["items"][number];

// The expanding panels: one full-width strip of photos, no inner wrap. On hover (or focus)
// a panel widens while the others give way; the description fades in on the wide panel.
function renderPhotoPanel(item: ServiceItem, image: Image): string {
  return `
          <article class="ar-panel" tabindex="0">
            ${renderImage(image, "ar-panel-photo")}
            <div class="ar-panel-shade" aria-hidden="true"></div>
            <div class="ar-panel-text">
              <h3 class="ar-caps-title">${renderText(item.title)}</h3>
              <p class="ar-small">${renderText(item.body)}</p>
            </div>
          </article>`;
}

// A service without a photo keeps the rhythm as a flat black panel with a line icon.
function renderIconPanel(item: ServiceItem, index: number): string {
  return `
          <article class="ar-panel ar-panel-plain" tabindex="0">
            ${renderIcon(item.icon, index, "ar-icon ar-icon-lg")}
            <div class="ar-panel-text">
              <h3 class="ar-caps-title">${renderText(item.title)}</h3>
              <p class="ar-small">${renderText(item.body)}</p>
            </div>
          </article>`;
}

function renderPanelRow(item: ServiceItem, index: number): string {
  return item.image ? renderPhotoPanel(item, item.image) : renderIconPanel(item, index);
}

// The alternative: a numbered table of rows with hairline dividers.
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

  const inner = rows
    ? `
    <div class="ar-wrap">${renderHead(props.eyebrow, props.title, props.body)}
      <div class="ar-service-rows">${items}
      </div>
    </div>`
    : `
    <div class="ar-panels-head">${renderHead(props.eyebrow, props.title, props.body)}
    </div>
    <div class="ar-panels">${items}
    </div>`;

  return renderSection(
    block,
    rows ? sectionClasses(context.tone) : "ar-sec ar-sec-flush",
    inner,
  );
}
