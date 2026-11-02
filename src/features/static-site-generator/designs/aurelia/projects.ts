import { escapeAttribute, renderText } from "../../content/html";
import { renderImage, renderSection } from "../../themes/agenvo/parts";
import type { BlockContext, ThemeBlock } from "../../themes/types";
import { renderCenteredHead, renderTextLink, sectionClasses } from "./parts";

type Project = ThemeBlock<"projects">["props"]["items"][number];

function renderStatus(status: string | undefined): string {
  return status ? `<span class="au-status">${renderText(status)}</span>` : "";
}

function renderCover(project: Project, ratio: string): string {
  return `
          <div class="au-cover ${ratio} au-zoom">
            ${renderImage(project.image, "")}
            ${renderStatus(project.status)}
          </div>`;
}

// The facts line of a project: its place and year parts, then its category.
function splitFacts(project: Project): string[] {
  const parts = project.meta
    .split(/\s[—–|·]\s|\s-\s/)
    .map((part) => part.trim())
    .filter(Boolean);

  return project.category ? [...parts, project.category] : parts;
}

function renderSpecs(project: Project): string {
  const facts = splitFacts(project);

  if (facts.length === 0) {
    return "";
  }

  return `<ul class="au-specs">${facts.map((fact) => `<li>${renderText(fact)}</li>`).join("")}</ul>`;
}

function renderTallCard(project: Project): string {
  const body = project.body ? `<p class="au-small">${renderText(project.body)}</p>` : "";
  const facts = project.category ? `${project.category} · ${project.meta}` : project.meta;

  return `${renderCover(project, "au-ratio-tall")}
          <div class="au-card-text">
            <h3 class="au-card-title au-gold">${renderText(project.title)}</h3>
            ${body}
            <p class="au-meta">${renderText(facts)}</p>
          </div>`;
}

function renderSpecsCard(project: Project): string {
  const body = project.body ? `<p class="au-small">${renderText(project.body)}</p>` : "";

  return `${renderCover(project, "au-ratio-wide")}
          <div class="au-card-text">
            <h3 class="au-card-title au-gold">${renderText(project.title)}</h3>
            ${renderSpecs(project)}
            ${body}
          </div>`;
}

function renderCard(project: Project, specs: boolean): string {
  const inner = specs ? renderSpecsCard(project) : renderTallCard(project);
  const content = project.href
    ? `<a href="${escapeAttribute(project.href)}" class="au-card-link">${inner}</a>`
    : inner;

  return `
        <article class="au-project au-reveal">${content}
        </article>`;
}

export function renderProjects(block: ThemeBlock<"projects">, context: BlockContext): string {
  const { props } = block;
  const specs = block.design === "aurelia/projects-specs";

  const inner = `
    <div class="au-wrap">${renderCenteredHead(props.eyebrow, props.title, props.body)}
      <div class="au-projects${specs ? " au-projects-specs" : ""}">${props.items.map((project) => renderCard(project, specs)).join("")}
      </div>
      <div class="au-center">${renderTextLink(props.link)}</div>
    </div>`;

  return renderSection(block, sectionClasses(context.tone), inner, "work");
}
