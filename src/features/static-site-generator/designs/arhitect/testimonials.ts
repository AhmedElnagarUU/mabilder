import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading, renderStars, sectionClasses } from "./parts";

type Props = ThemeBlock<"testimonials">["props"];
type Item = Props["items"][number];

function renderAuthor(item: Item): string {
  const company = item.company ? ` — ${renderText(item.company)}` : "";

  return renderText(item.author) + company;
}

function renderQuoteText(item: Item, classes: string): string {
  const rating = item.rating === undefined ? "" : `<p class="ar-quote-stars">${renderStars(item.rating, `${item.rating} / 5`)}</p>`;

  return `<blockquote class="${classes}">${rating}<p class="ar-quote-text">${renderText(item.quote)}</p>
          <footer class="ar-caps ar-quote-author">${renderAuthor(item)}</footer>
        </blockquote>`;
}

// One review stands tall in uppercase on an inverted white band; the rest pair up beneath it.
function renderInverted(block: ThemeBlock<"testimonials">): string {
  const { props } = block;
  const [first, ...rest] = props.items;
  const average =
    props.averageRating === undefined || props.reviewCount === undefined
      ? ""
      : `<p class="ar-average ar-reveal">${renderStars(Math.round(props.averageRating), `${props.averageRating} / 5`)} <span dir="ltr">${props.averageRating} / 5 (${props.reviewCount})</span></p>`;

  const more = rest.length === 0 ? "" : `<div class="ar-quote-grid">${rest.map((item) => renderQuoteText(item, "ar-quote-small ar-reveal")).join("")}</div>`;

  return `
    <div class="ar-wrap ar-quote-head">
      ${renderEyebrow(props.eyebrow)}
      ${renderHeading(props.title)}${average}
      ${renderQuoteText(first, "ar-quote ar-quote-giant ar-reveal")}
      ${more}
    </div>`;
}

// The second design: a quiet list of quotes separated by hairlines.
function renderList(block: ThemeBlock<"testimonials">): string {
  const { props } = block;

  const items = props.items
    .map(
      (item) => `
          <div class="ar-quote-line ar-reveal">
            ${renderQuoteText(item, "ar-quote")}
          </div>`,
    )
    .join("");

  return `
    <div class="ar-wrap">${renderEyebrow(props.eyebrow)}
      ${renderHeading(props.title)}
      <div class="ar-quote-lines">${items}
      </div>
    </div>`;
}

export function renderTestimonials(block: ThemeBlock<"testimonials">, context: BlockContext): string {
  const inverted = block.design !== "arhitect/testimonials-list";

  if (inverted) {
    return renderSection(block, "ar-sec ar-invert ar-quotes", renderInverted(block));
  }

  return renderSection(block, sectionClasses(context.tone), renderList(block));
}
