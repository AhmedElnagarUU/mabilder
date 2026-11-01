import { escapeAttribute, renderText } from "../../content/html";
import { renderImage, renderSection, stepNumber } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderCenteredHead, renderIcon, sectionClasses } from "./parts";

// Section types the owner's Aurelia source has no picture of. They follow the same type, lines and spacing.

export function renderMarquee(block: ThemeBlock<"marquee">, context: BlockContext): string {
  const items = block.props.items.map((item) => `<li>${renderText(item)}</li>`).join("");

  return renderSection(
    block,
    sectionClasses(context.tone, "au-sec-tight au-ticker"),
    `<ul class="au-wrap au-ticker-list">${items}</ul>`,
  );
}

export function renderValues(block: ThemeBlock<"values">, context: BlockContext): string {
  const { props } = block;
  const items = props.items
    .map(
      (item, index) => `
        <div class="au-value au-reveal">
          <span class="au-step-number">${stepNumber(index)}</span>
          <h3 class="au-card-title">${renderText(item.title)}</h3>
          <p class="au-small">${renderText(item.body)}</p>
        </div>`,
    )
    .join("");

  const inner = `
    <div class="au-wrap">${renderCenteredHead(props.eyebrow, props.title, props.body)}
      <div class="au-values">${items}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderClients(block: ThemeBlock<"clients">, context: BlockContext): string {
  const { props } = block;
  const names = props.names.map((name) => `<li class="au-reveal">${renderText(name)}</li>`).join("");

  const inner = `
    <div class="au-wrap">${renderCenteredHead(props.eyebrow, props.title, props.body)}
      <ul class="au-clients">${names}</ul>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderAwards(block: ThemeBlock<"awards">, context: BlockContext): string {
  const { props } = block;
  const items = props.items
    .map(
      (award, index) => `
        <li class="au-row au-reveal">
          <span class="au-row-year">${renderText(award.year)}</span>
          <span>${renderText(award.title)}</span>
          ${renderIcon("star", index, "au-icon au-icon-sm")}
        </li>`,
    )
    .join("");

  const inner = `
    <div class="au-wrap au-narrow">${renderCenteredHead(props.eyebrow, props.title, props.body)}
      <ul class="au-rows">${items}
      </ul>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderTimeline(block: ThemeBlock<"timeline">, context: BlockContext): string {
  const { props } = block;
  const items = props.items
    .map(
      (item) => `
        <li class="au-row au-row-top au-reveal">
          <span class="au-row-year au-row-year-lg">${renderText(item.year)}</span>
          <div>
            <h3 class="au-card-title">${renderText(item.title)}</h3>
            <p class="au-small">${renderText(item.body)}</p>
          </div>
        </li>`,
    )
    .join("");

  const inner = `
    <div class="au-wrap au-narrow">${renderCenteredHead(props.eyebrow, props.title, props.body)}
      <ol class="au-rows">${items}
      </ol>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderTeam(block: ThemeBlock<"team">, context: BlockContext): string {
  const { props } = block;
  const people = props.items
    .map(
      (person) => `
        <article class="au-person au-reveal">
          ${person.image ? `<div class="au-cover au-ratio-tall au-zoom">${renderImage(person.image, "")}</div>` : ""}
          <h3 class="au-card-title au-gold">${renderText(person.name)}</h3>
          <p class="au-caps">${renderText(person.role)}</p>
          <p class="au-small">${renderText(person.bio)}</p>
        </article>`,
    )
    .join("");

  const inner = `
    <div class="au-wrap">${renderCenteredHead(props.eyebrow, props.title, props.body)}
      <div class="au-people">${people}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

function renderLocationLink(href: string, text: string): string {
  return `<p><a href="${escapeAttribute(href)}" class="au-underline">${renderText(text)}</a></p>`;
}

export function renderLocation(block: ThemeBlock<"location">, context: BlockContext): string {
  const { props } = block;
  const phone = props.phone ? renderLocationLink(`tel:${props.phone.replace(/\s+/g, "")}`, props.phone) : "";
  const email = props.email ? renderLocationLink(`mailto:${props.email}`, props.email) : "";

  const inner = `
    <div class="au-wrap">${renderCenteredHead(props.eyebrow, props.title, props.body)}
      <article class="au-place au-reveal">
        <a href="${escapeAttribute(props.mapHref)}" target="_blank" rel="noopener" class="au-place-address">${renderText(props.address)}</a>
        <div class="au-small">${phone}${email}</div>
      </article>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
