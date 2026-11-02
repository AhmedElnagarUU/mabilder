import { escapeAttribute, renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderEyebrow, renderHeading, renderOptionalBody, renderTextLink, sectionClasses } from "./parts";

type Project = ThemeBlock<"projects">["props"]["items"][number];

function renderCover(project: Project, ratio: string): string {
  return `<div class="at-cover ${ratio}">${renderImage(project.image, "")}</div>`;
}

function renderColumnCard(project: Project): string {
  const body = project.body ? `<p class="at-small">${renderText(project.body)}</p>` : "";
  const category = project.category ? `<span class="at-meta-sep">${renderText(project.category)}</span>` : "";

  return `${renderCover(project, "at-ratio-tall")}
          <div class="at-card-text">
            <p class="at-place">${renderText(project.meta)}</p>
            <h3 class="at-card-title">${renderText(project.title)}</h3>
            ${body}
            ${category}
          </div>`;
}

function renderCarouselCard(project: Project): string {
  const tags = [project.category, project.status]
    .filter((tag): tag is string => Boolean(tag))
    .map((tag) => `<span class="at-tag">${renderText(tag)}</span>`)
    .join("");
  const body = project.body ? `<p class="at-small">${renderText(project.body)}</p>` : "";

  return `${renderCover(project, "at-ratio-wide")}
          <div class="at-card-text">
            <div class="at-tags">${tags}</div>
            <h3 class="at-card-title">${renderText(project.title)}</h3>
            <p class="at-place">${renderText(project.meta)}</p>
            ${body}
          </div>`;
}

function renderCard(project: Project, carousel: boolean): string {
  const inner = carousel ? renderCarouselCard(project) : renderColumnCard(project);
  const content = project.href ? `<a href="${escapeAttribute(project.href)}" class="at-card-link">${inner}</a>` : inner;

  return `
        <article class="at-project at-reveal">${content}
        </article>`;
}

// Columns: the title sits in its own column beside three cards. Carousel: a scroll-snap row with tags.
function renderColumns(block: ThemeBlock<"projects">): string {
  const { props } = block;

  return `
    <div class="at-wrap at-projects-layout">
      <header class="at-head at-head-start at-projects-head">
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
        ${renderOptionalBody(props.body)}
        ${renderTextLink(props.link)}
      </header>
      <div class="at-projects">${props.items.map((project) => renderCard(project, false)).join("")}
      </div>
    </div>`;
}

function renderCarousel(block: ThemeBlock<"projects">): string {
  const { props } = block;

  return `
    <div class="at-wrap">
      <header class="at-head at-head-start">
        ${renderEyebrow(props.eyebrow)}
        ${renderHeading(props.title)}
        ${renderOptionalBody(props.body)}
      </header>
      <div class="at-carousel" tabindex="0">${props.items.map((project) => renderCard(project, true)).join("")}
      </div>
      ${renderTextLink(props.link)}
    </div>`;
}

export function renderProjects(block: ThemeBlock<"projects">, context: BlockContext): string {
  const carousel = block.design === "atelier/projects-carousel";
  const inner = carousel ? renderCarousel(block) : renderColumns(block);

  return renderSection(block, sectionClasses(context.tone), inner, "work");
}
