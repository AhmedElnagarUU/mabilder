import { renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import {
  getToneStyle,
  renderHeader,
  renderImage,
  renderSection,
  sectionPadding,
} from "../parts";

export function renderTeam(block: ThemeBlock<"team">, context: BlockContext): string {
  const { props } = block;
  const style = getToneStyle(context.tone);

  const inner = `
    <div class="max-w-7xl mx-auto">${renderHeader(props.eyebrow, props.title, props.body, style)}
      <div class="grid md:grid-cols-3 gap-8">
        ${props.items
          .map(
            (person) => `
        <article class="reveal">
          ${person.image ? `<div class="portrait overflow-hidden aspect-[4/5] mb-5">${renderImage(person.image, "w-full h-full object-cover")}</div>` : ""}
          <h3 class="font-display text-2xl">${renderText(person.name)}</h3>
          <p class="text-[11px] uppercase tracking-[0.2em] text-brass mt-1">${renderText(person.role)}</p>
          <p class="text-sm ${style.body} leading-relaxed mt-3">${renderText(person.bio)}</p>
        </article>`,
          )
          .join("")}
      </div>
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding}`, inner);
}
