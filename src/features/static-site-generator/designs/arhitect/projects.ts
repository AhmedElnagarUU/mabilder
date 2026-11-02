import { escapeAttribute, renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderHead, renderIndex, renderTextLink, sectionClasses } from "./parts";

type Project = ThemeBlock<"projects">["props"]["items"][number];

// Two columns of big cards. Each card opens with its index number.
function renderGridCard(project: Project, index: number): string {
  const caption = `
            <div class="ar-caption-top">${renderIndex(index)}${project.category ? `<span class="ar-caps-inline">${renderText(project.category)}</span>` : ""}</div>
            <h3 class="ar-card-title">${renderText(project.title)}</h3>
            <p class="ar-meta">${renderText(project.meta)}</p>
            ${project.body ? `<p class="ar-small">${renderText(project.body)}</p>` : ""}`;
  const inner = `
          <div class="ar-item-cover">${renderImage(project.image, "ar-img-cover ar-photo")}</div>
          <div class="ar-card-text">${caption}
          </div>`;
  const content = project.href
    ? `<a href="${escapeAttribute(project.href)}" class="ar-cover-link">${inner}</a>`
    : inner;

  return `
        <article class="ar-project-card ar-reveal">${content}
        </article>`;
}

// One row per project across the full width; the thumb grows when the row has focus or hover.
function renderRowCard(project: Project, index: number): string {
  const text = `
              <h3 class="ar-caps-title">${renderText(project.title)}</h3>
              <p class="ar-meta">${renderText(project.meta)}</p>`;
  const inner = `${renderIndex(index, "ar-index ar-index-row")}
            <div>${text}
            </div>
            <div class="ar-project-thumb">${renderImage(project.image, "ar-img-cover ar-photo")}</div>`;
  const content = project.href
    ? `<a href="${escapeAttribute(project.href)}" class="ar-row-link">${inner}</a>`
    : inner;

  return `
          <article class="ar-project-row ar-reveal">${content}
          </article>`;
}

export function renderProjects(block: ThemeBlock<"projects">, context: BlockContext): string {
  const { props } = block;
  const rows = block.design === "arhitect/projects-rows";
  const items = props.items
    .map((project, index) => (rows ? renderRowCard(project, index) : renderGridCard(project, index)))
    .join("");

  const grid = rows
    ? `
      <div class="ar-project-rows">${items}
      </div>`
    : `
      <div class="ar-projects-grid">${items}
      </div>`;

  const inner = `
    <div class="ar-wrap">${renderHead(props.eyebrow, props.title, props.body)}${grid}
      <div class="ar-end-row">${renderTextLink(props.link)}</div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner, "work");
}
