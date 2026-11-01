import type { Image } from "../../blocks/common";
import { escapeAttribute, renderText } from "../../content/html";
import type { ProjectDetail } from "../../content/project-pages";
import { pageHref, renderImage } from "../agenvo/parts";
import type { PageContext } from "../types";

const arrow =
  '<svg class="au-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true" focusable="false"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';

function renderBackLink(detail: ProjectDetail, context: PageContext): string {
  if (!detail.backLink) {
    return "";
  }

  const href = escapeAttribute(pageHref(context, detail.backLink.href));

  return `<a href="${href}" class="au-link au-back">${arrow}${renderText(detail.backLink.label)}</a>`;
}

function renderBadges(detail: ProjectDetail): string {
  const badges = [
    detail.category ? `<span class="au-eyebrow au-eyebrow-tight">${renderText(detail.category)}</span>` : "",
    detail.status ? `<span class="au-status au-status-inline">${renderText(detail.status)}</span>` : "",
  ].filter(Boolean);

  return badges.length === 0 ? "" : `<div class="au-badges">${badges.join("")}</div>`;
}

function renderHeaderSection(detail: ProjectDetail, context: PageContext): string {
  const summary = detail.summary ? `<p class="au-hero-body">${renderText(detail.summary)}</p>` : "";

  return `
  <section data-project-part="header" class="au-project-head">
    <div class="au-pattern" aria-hidden="true"></div>
    <div class="au-wrap au-narrow">
      ${renderBackLink(detail, context)}
      ${renderBadges(detail)}
      <h1 class="au-hero-title">${renderText(detail.title)}</h1>
      ${summary}
    </div>
  </section>`;
}

function renderCoverSection(detail: ProjectDetail): string {
  return `
  <section data-project-part="cover" class="au-sec au-sec-tight">
    <div class="au-wrap">
      <div class="au-cover au-ratio-wide">${renderImage(detail.cover, "")}</div>
    </div>
  </section>`;
}

function renderFactsSection(detail: ProjectDetail): string {
  if (detail.facts.length === 0) {
    return "";
  }

  const rows = detail.facts
    .map(
      (fact) => `
        <div>
          <dt class="au-caps">${renderText(fact.label)}</dt>
          <dd class="au-fact-value">${renderText(fact.value)}</dd>
        </div>`,
    )
    .join("");

  return `
  <section data-project-part="facts" class="au-sec au-band au-sec-tight">
    <dl class="au-wrap au-facts">${rows}
    </dl>
  </section>`;
}

function renderStorySection(detail: ProjectDetail): string {
  if (detail.story.length === 0) {
    return "";
  }

  const steps = detail.story
    .map(
      (step) => `
        <div class="au-reveal">
          <h2 class="au-title au-title-sm">${renderText(step.heading)}</h2>
          <p class="au-body">${renderText(step.body)}</p>
        </div>`,
    )
    .join("");

  return `
  <section data-project-part="story" class="au-sec">
    <div class="au-wrap au-narrow au-story">${steps}
    </div>
  </section>`;
}

function renderPhotoGroup(title: string, images: Image[], part: string): string {
  if (images.length === 0) {
    return "";
  }

  const photos = images
    .map((image) => `<div class="au-cover au-ratio-wide au-zoom au-reveal">${renderImage(image, "")}</div>`)
    .join("\n        ");

  return `
  <section data-project-part="${part}" class="au-sec au-sec-tight">
    <div class="au-wrap">
      <h2 class="au-title au-title-sm au-reveal">${renderText(title)}</h2>
      <div class="au-photo-grid">
        ${photos}
      </div>
    </div>
  </section>`;
}

function renderCtaSection(detail: ProjectDetail, context: PageContext): string {
  const askHref = escapeAttribute(pageHref(context, detail.ask.href));
  const href = escapeAttribute(pageHref(context, detail.cta.href));

  return `
  <section data-project-part="cta" class="au-sec au-band">
    <div class="au-wrap au-actions au-actions-center">
      <a href="${askHref}" data-project-ask class="au-btn au-btn-solid">${renderText(detail.ask.label)}${arrow}</a>
      <a href="${href}" class="au-btn au-btn-outline">${renderText(detail.cta.label)}</a>
    </div>
  </section>`;
}

export function renderProject(detail: ProjectDetail, context: PageContext): string {
  return [
    renderHeaderSection(detail, context),
    renderCoverSection(detail),
    renderFactsSection(detail),
    renderStorySection(detail),
    renderPhotoGroup(detail.beforeTitle, detail.before, "before"),
    renderPhotoGroup(detail.galleryTitle, detail.gallery, "gallery"),
    renderCtaSection(detail, context),
  ].join("");
}
