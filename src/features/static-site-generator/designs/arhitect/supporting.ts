import { escapeAttribute, renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderHead, renderIcon, sectionClasses } from "./parts";

// Section types the owner's Arhitect source has no picture of. They follow the same
// black grid, uppercase type and hairline language as the main designs.

export function renderMarquee(block: ThemeBlock<"marquee">, context: BlockContext): string {
  const items = block.props.items.map((item) => `<li>${renderText(item)}</li>`).join("");

  return renderSection(
    block,
    sectionClasses(context.tone, "ar-sec-tight ar-ticker"),
    `<ul class="ar-wrap ar-ticker-list">${items}</ul>`,
  );
}

export function renderValues(block: ThemeBlock<"values">, context: BlockContext): string {
  const { props } = block;
  const items = props.items
    .map(
      (item, index) => `
          <div class="ar-value ar-reveal">
            ${renderIcon(item.icon, index, "ar-icon")}
            <h3 class="ar-caps-title">${renderText(item.title)}</h3>
            <p class="ar-small">${renderText(item.body)}</p>
          </div>`,
    )
    .join("");

  const inner = `${renderHead(props.eyebrow, props.title, props.body)}
    <div class="ar-wrap">
      <div class="ar-cols">${items}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderClients(block: ThemeBlock<"clients">, context: BlockContext): string {
  const { props } = block;
  const names = props.names.map((name) => `<li class="ar-reveal">${renderText(name)}</li>`).join("");

  const inner = `
    <div class="ar-wrap">${renderHead(props.eyebrow, props.title, props.body)}
      <ul class="ar-clients">${names}</ul>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderAwards(block: ThemeBlock<"awards">, context: BlockContext): string {
  const { props } = block;
  const items = props.items
    .map(
      (award) => `
          <li class="ar-row ar-reveal">
            <span class="ar-year">${renderText(award.year)}</span>
            <span>${renderText(award.title)}</span>
          </li>`,
    )
    .join("");

  const inner = `
    <div class="ar-wrap ar-narrow">${renderHead(props.eyebrow, props.title, props.body)}
      <ul class="ar-rows">${items}
      </ul>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderTimeline(block: ThemeBlock<"timeline">, context: BlockContext): string {
  const { props } = block;
  const items = props.items
    .map(
      (item) => `
          <li class="ar-row ar-row-top ar-reveal">
            <span class="ar-year ar-year-lg">${renderText(item.year)}</span>
            <div>
              <h3 class="ar-caps-title">${renderText(item.title)}</h3>
              <p class="ar-small">${renderText(item.body)}</p>
            </div>
          </li>`,
    )
    .join("");

  const inner = `
    <div class="ar-wrap ar-narrow">${renderHead(props.eyebrow, props.title, props.body)}
      <ol class="ar-rows">${items}
      </ol>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderTeam(block: ThemeBlock<"team">, context: BlockContext): string {
  const { props } = block;
  const people = props.items
    .map(
      (person) => `
          <article class="ar-person ar-reveal">
            ${person.image ? `<div class="ar-item-cover ar-ratio-tall">${renderImage(person.image, "ar-img-cover ar-photo")}</div>` : ""}
            <p class="ar-caps">${renderText(person.role)}</p>
            <h3 class="ar-card-title">${renderText(person.name)}</h3>
            <p class="ar-small">${renderText(person.bio)}</p>
          </article>`,
    )
    .join("");

  const inner = `
    <div class="ar-wrap">${renderHead(props.eyebrow, props.title, props.body)}
      <div class="ar-people">${people}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderLocation(block: ThemeBlock<"location">, context: BlockContext): string {
  const { props } = block;
  const phone = props.phone
    ? `<p><a href="tel:${escapeAttribute(props.phone.replace(/\s+/g, ""))}" class="ar-underline" dir="ltr">${renderText(props.phone)}</a></p>`
    : "";
  const email = props.email
    ? `<p><a href="mailto:${escapeAttribute(props.email)}" class="ar-underline">${renderText(props.email)}</a></p>`
    : "";

  const inner = `
    <div class="ar-wrap">${renderHead(props.eyebrow, props.title, props.body)}
      <article class="ar-place ar-reveal">
        <a href="${escapeAttribute(props.mapHref)}" target="_blank" rel="noopener" class="ar-place-address">${renderText(props.address)}</a>
        <div class="ar-small">${phone}${email}</div>
      </article>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
