import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading, renderStars, sectionClasses } from "./parts";

type Props = ThemeBlock<"testimonials">["props"];
type Testimonial = Props["items"][number];

function renderAuthor(item: Testimonial): string {
  const company = item.company ? ` — ${renderText(item.company)}` : "";

  return `${renderText(item.author)}${company}`;
}

function renderAverage(props: Props): string {
  if (props.averageRating === undefined || props.reviewCount === undefined) {
    return "";
  }

  const stars = renderStars(Math.round(props.averageRating), `${props.averageRating} / 5`);

  return `<p class="au-average au-reveal">${stars} <span dir="ltr">${props.averageRating} / 5 (${props.reviewCount})</span></p>`;
}

function renderItemRating(item: Testimonial): string {
  return item.rating === undefined ? "" : `<p class="au-quote-stars">${renderStars(item.rating, `${item.rating} / 5`)}</p>`;
}

function renderQuote(item: Testimonial): string {
  return `
        <blockquote class="au-quote">
          ${renderItemRating(item)}<p class="au-quote-text">${renderText(item.quote)}</p>
          <footer class="au-caps">${renderAuthor(item)}</footer>
        </blockquote>`;
}

// One review stands alone; several sit in a scroll-snap row that works with touch and keyboard.
export function renderTestimonials(block: ThemeBlock<"testimonials">, context: BlockContext): string {
  const { props } = block;
  const row = props.items.length > 1 ? " au-quotes-row" : "";
  const tabindex = props.items.length > 1 ? ' tabindex="0"' : "";

  const inner = `
    <div class="au-wrap au-center">
      ${renderEyebrow(props.eyebrow)}
      ${renderHeading(props.title)}${renderAverage(props)}
      <div class="au-quotes${row} au-reveal"${tabindex}>${props.items.map(renderQuote).join("")}
      </div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner);
}
