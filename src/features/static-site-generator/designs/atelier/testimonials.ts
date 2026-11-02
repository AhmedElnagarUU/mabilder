import { renderText } from "../../content/html";
import { renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading, renderStars, sectionClasses } from "./parts";

type Props = ThemeBlock<"testimonials">["props"];
type Testimonial = Props["items"][number];

function renderAuthor(item: Testimonial): string {
  const company = item.company ? `, ${renderText(item.company)}` : "";

  return `— ${renderText(item.author)}${company}`;
}

function renderItemRating(item: Testimonial): string {
  return item.rating === undefined ? "" : `<p class="at-quote-stars">${renderStars(item.rating, `${item.rating} / 5`)}</p>`;
}

function renderQuote(item: Testimonial): string {
  return `
        <blockquote class="at-quote">
          ${renderItemRating(item)}<p class="at-quote-text">${renderText(item.quote)}</p>
          <footer class="at-caps">${renderAuthor(item)}</footer>
        </blockquote>`;
}

// Band: a dark band, one large serif quote at a time (several sit in a snap row, dots added by script).
function renderBand(block: ThemeBlock<"testimonials">): string {
  const { props } = block;
  const many = props.items.length > 1;

  return `
    <div class="at-wrap at-band-inner">
      ${renderEyebrow(props.eyebrow)}
      ${renderHeading(props.title)}
      <div class="at-quotes${many ? " at-quotes-row" : ""}"${many ? ' tabindex="0" data-dots' : ""}>${props.items.map(renderQuote).join("")}
      </div>
    </div>`;
}

function renderSummary(props: Props): string {
  if (props.averageRating === undefined) {
    return "";
  }

  const count = props.reviewCount === undefined ? "" : `<span class="at-caps" dir="ltr">(${props.reviewCount})</span>`;

  return `
        <div class="at-rating at-reveal">
          <p class="at-rating-number" dir="ltr">${props.averageRating}</p>
          ${renderStars(Math.round(props.averageRating), `${props.averageRating} / 5`)}
          ${count}
        </div>`;
}

// Rating: the summary figure beside the reviews, each with its stars.
function renderRating(block: ThemeBlock<"testimonials">): string {
  const { props } = block;

  return `
    <div class="at-wrap at-rating-layout">
      <header class="at-head at-head-start">
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}${renderSummary(props)}
      </header>
      <div class="at-quotes at-quotes-list">${props.items.map(renderQuote).join("")}
      </div>
    </div>`;
}

export function renderTestimonials(block: ThemeBlock<"testimonials">, context: BlockContext): string {
  const rating = block.design === "atelier/testimonials-rating";
  const classes = rating ? sectionClasses(context.tone) : "at-sec at-dark";

  return renderSection(block, classes, rating ? renderRating(block) : renderBand(block));
}
