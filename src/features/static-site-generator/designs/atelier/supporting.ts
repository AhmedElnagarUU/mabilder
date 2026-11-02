import { escapeAttribute, renderText } from "../../content/html";
import { renderImage, renderSection, stepNumber } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderHead, sectionClasses } from "./parts";

// Section types without a picture in the plan's table. Same serif, hairlines and spacing as the rest.

export function renderMarquee(block: ThemeBlock<"marquee">, context: BlockContext): string {
  const items = block.props.items.map((item) => `<li>${renderText(item)}</li>`).join("");

  return renderSection(
    block,
    sectionClasses(context.tone, "at-sec-tight at-ticker"),
    `<ul class="at-wrap at-ticker-list">${items}</ul>`,
  );
}

export function renderValues(block: ThemeBlock<"values">, context: BlockContext): string {
  const { props } = block;
  const items = props.items
    .map(
      (item, index) => `
        <div class="at-value at-reveal">
          <span class="at-step-number">${stepNumber(index)}</span>
          <h3 class="at-card-title">${renderText(item.title)}</h3>
          <p class="at-small">${renderText(item.body)}</p>
        </div>`,
    )
    .join("");

  const inner = `
    <div class="at-wrap">${renderHead(props.eyebrow, props.title, props.body)}
      <div class="at-values">${items}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderClients(block: ThemeBlock<"clients">, context: BlockContext): string {
  const { props } = block;
  const names = props.names.map((name) => `<li class="at-reveal">${renderText(name)}</li>`).join("");

  const inner = `
    <div class="at-wrap">${renderHead(props.eyebrow, props.title, props.body)}
      <ul class="at-clients">${names}</ul>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderAwards(block: ThemeBlock<"awards">, context: BlockContext): string {
  const { props } = block;
  const items = props.items
    .map(
      (award) => `
        <li class="at-row at-reveal">
          <span class="at-row-year">${renderText(award.year)}</span>
          <span>${renderText(award.title)}</span>
        </li>`,
    )
    .join("");

  const inner = `
    <div class="at-wrap at-narrow">${renderHead(props.eyebrow, props.title, props.body)}
      <ul class="at-rows">${items}
      </ul>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderTimeline(block: ThemeBlock<"timeline">, context: BlockContext): string {
  const { props } = block;
  const items = props.items
    .map(
      (item) => `
        <li class="at-row at-row-top at-reveal">
          <span class="at-row-year at-row-year-lg">${renderText(item.year)}</span>
          <div>
            <h3 class="at-card-title">${renderText(item.title)}</h3>
            <p class="at-small">${renderText(item.body)}</p>
          </div>
        </li>`,
    )
    .join("");

  const inner = `
    <div class="at-wrap at-narrow">${renderHead(props.eyebrow, props.title, props.body)}
      <ol class="at-rows">${items}
      </ol>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

export function renderTeam(block: ThemeBlock<"team">, context: BlockContext): string {
  const { props } = block;
  const people = props.items
    .map(
      (person) => `
        <article class="at-person at-reveal">
          ${person.image ? `<div class="at-cover at-ratio-tall">${renderImage(person.image, "")}</div>` : ""}
          <h3 class="at-card-title">${renderText(person.name)}</h3>
          <p class="at-place">${renderText(person.role)}</p>
          <p class="at-small">${renderText(person.bio)}</p>
        </article>`,
    )
    .join("");

  const inner = `
    <div class="at-wrap">${renderHead(props.eyebrow, props.title, props.body)}
      <div class="at-people">${people}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}

function renderLocationLink(href: string, text: string): string {
  return `<p><a href="${escapeAttribute(href)}" class="at-underline">${renderText(text)}</a></p>`;
}

export function renderLocation(block: ThemeBlock<"location">, context: BlockContext): string {
  const { props } = block;
  const phone = props.phone ? renderLocationLink(`tel:${props.phone.replace(/\s+/g, "")}`, props.phone) : "";
  const email = props.email ? renderLocationLink(`mailto:${props.email}`, props.email) : "";

  const inner = `
    <div class="at-wrap">${renderHead(props.eyebrow, props.title, props.body)}
      <article class="at-place-box at-reveal">
        <a href="${escapeAttribute(props.mapHref)}" target="_blank" rel="noopener" class="at-place-address">${renderText(props.address)}</a>
        <div class="at-small">${phone}${email}</div>
      </article>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
