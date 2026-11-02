import { escapeAttribute, renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderHead, renderIndex, renderTextLink, sectionClasses } from "./parts";

type Project = ThemeBlock<"projects">["props"]["items"][number];

// The card from the source: photo block of fixed height, small uppercase title, place and year.
function renderGridCard(project: Project): string {
  const inner = `
          <div class="ar-item-cover">${renderImage(project.image, "ar-img-cover ar-photo")}</div>
          <h3 class="ar-card-title">${renderText(project.title)}</h3>
          <p class="ar-meta">${renderText(project.meta)}</p>`;
  const content = project.href
    ? `<a href="${escapeAttribute(project.href)}" class="ar-cover-link">${inner}</a>`
    : inner;

  return `
        <article class="ar-project-card ar-reveal">${content}
        </article>`;
}

// The alternative: one row per project across the full width, with an index number.
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
    .map((project, index) => (rows ? renderRowCard(project, index) : renderGridCard(project)))
    .join("");

  const grid = rows
    ? `
      <div class="ar-project-rows">${items}
      </div>`
    : `
      <div class="ar-projects-grid">${items}
      </div>`;

  const inner = `${renderHead(props.eyebrow, props.title, props.body)}
    <div class="ar-wrap">${grid}
      <div class="ar-end-row">${renderTextLink(props.link)}</div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner, "work");
}
