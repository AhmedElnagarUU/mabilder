import { renderText } from "../../../content/html";
import type { BlockContext, ThemeBlock } from "../../types";
import {
  getToneStyle,
  renderHeader,
  renderImage,
  renderSection,
  renderTextLink,
  sectionPadding,
  type ToneStyle,
} from "../parts";

type Project = ThemeBlock<"projects">["props"]["items"][number];

function renderCategory(category: string | undefined): string {
  if (!category) {
    return "";
  }

  return `<span class="text-[10px] uppercase tracking-[0.18em] text-brass whitespace-nowrap">${renderText(category)}</span>`;
}

function renderProjectBody(body: string | undefined, style: ToneStyle): string {
  if (!body) {
    return "";
  }

  return `<p class="text-sm ${style.body} leading-relaxed mt-3">${renderText(body)}</p>`;
}

function renderFeaturedProject(project: Project, index: number, style: ToneStyle): string {
  const large = index < 2;
  const span = index === 0 ? "md:col-span-7" : index === 1 ? "md:col-span-5" : "md:col-span-4";
  const height = large ? "h-72 md:h-[480px]" : "h-64";

  return `
        <article class="${span} reveal">
          <div class="img-zoom overflow-hidden rounded-sm">
            ${renderImage(project.image, `w-full ${height} object-cover`)}
          </div>
          <div class="mt-4 flex justify-between items-start gap-4">
            <div>
              <h3 class="font-display ${large ? "text-2xl" : "text-xl"}">${renderText(project.title)}</h3>
              <p class="text-sm ${style.muted} mt-1">${renderText(project.meta)}</p>
            </div>
            ${renderCategory(project.category)}
          </div>
          ${large ? renderProjectBody(project.body, style) : ""}
        </article>`;
}

function renderGridProject(project: Project, style: ToneStyle): string {
  return `
        <article class="reveal">
          <div class="img-zoom overflow-hidden">
            ${renderImage(project.image, "w-full h-64 md:h-72 object-cover")}
          </div>
          <div class="mt-4 flex items-start justify-between gap-4">
            <div>
              <h3 class="font-display text-2xl">${renderText(project.title)}</h3>
              <p class="text-sm ${style.muted} mt-1">${renderText(project.meta)}</p>
            </div>
            ${renderCategory(project.category)}
          </div>
          ${renderProjectBody(project.body, style)}
        </article>`;
}

export function renderProjects(block: ThemeBlock<"projects">, context: BlockContext): string {
  const { props } = block;
  const style = getToneStyle(context.tone);
  const featured = block.variant === "featured";
  const grid = featured
    ? "grid md:grid-cols-12 gap-x-4 gap-y-12"
    : "grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12";
  const items = props.items
    .map((project, index) =>
      featured ? renderFeaturedProject(project, index, style) : renderGridProject(project, style),
    )
    .join("");

  const inner = `
    <div class="max-w-7xl mx-auto">${renderHeader(props.eyebrow, props.title, props.body, style)}
      <div class="${grid}">${items}
      </div>
      ${renderTextLink(props.link, "mt-12")}
    </div>`;

  return renderSection(block, `${style.section} ${sectionPadding}`, inner, "work");
}
