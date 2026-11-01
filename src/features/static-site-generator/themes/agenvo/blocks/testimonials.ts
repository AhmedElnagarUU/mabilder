import { escapeAttribute, renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import {
  getToneStyle,
  renderEyebrow,
  renderSection,
  renderTitle,
  sectionPadding,
} from "../parts";

type Testimonial = ThemeBlock<"testimonials">["props"]["items"][number];

function renderAuthor(item: Testimonial): string {
  const company = item.company ? ` — ${renderText(item.company)}` : "";
  return `${renderText(item.author)}${company}`;
}

function renderStars(rating: number, label: string): string {
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);
  return `<span role="img" aria-label="${escapeAttribute(label)}" class="text-brass tracking-widest">${stars}</span>`;
}

function renderAverage(props: ThemeBlock<"testimonials">["props"]): string {
  if (props.averageRating === undefined || props.reviewCount === undefined) {
    return "";
  }

  const stars = renderStars(Math.round(props.averageRating), `${props.averageRating} / 5`);
  return `<p class="mt-6 text-sm reveal">${stars} <span dir="ltr">${props.averageRating} / 5 (${props.reviewCount})</span></p>`;
}

function renderRating(item: Testimonial): string {
  return item.rating === undefined ? "" : `<p class="mb-3 text-lg">${renderStars(item.rating, `${item.rating} / 5`)}</p>`;
}

export function renderTestimonials(
  block: ThemeBlock<"testimonials">,
  context: BlockContext,
): string {
  const { props } = block;
  const style = getToneStyle(context.tone);

  const inner = `
    <div class="max-w-4xl mx-auto">
      ${renderEyebrow(props.eyebrow)}
      ${renderTitle(props.title)}${renderAverage(props)}
      <div class="mt-14 space-y-14">
        ${props.items
          .map(
            (item) => `
        <blockquote class="border-s-2 border-brass ps-8 reveal">
          ${renderRating(item)}<p class="font-display text-2xl md:text-3xl leading-snug">${renderText(item.quote)}</p>
          <footer class="mt-5 text-[11px] uppercase tracking-[0.2em] ${style.muted}">${renderAuthor(item)}</footer>
        </blockquote>`,
          )
          .join("")}
      </div>
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
