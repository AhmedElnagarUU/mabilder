import type { Image } from "../../blocks/common";
import { escapeAttribute, renderText } from "../../content/html";
import type { ProjectDetail } from "../../content/project-pages";
import { pageHref, renderImage } from "../agenvo/parts";
import type { PageContext } from "../types";

const arrow =
  '<svg class="at-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true" focusable="false"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';

function renderBackLink(detail: ProjectDetail, context: PageContext): string {
  if (!detail.backLink) {
    return "";
  }

  const href = escapeAttribute(pageHref(context, detail.backLink.href));

  return `<a href="${href}" class="at-link at-back">${arrow}${renderText(detail.backLink.label)}</a>`;
}

function renderBadges(detail: ProjectDetail): string {
  const badges = [
    detail.category ? `<span class="at-eyebrow">${renderText(detail.category)}</span>` : "",
    detail.status ? `<span class="at-tag">${renderText(detail.status)}</span>` : "",
  ].filter(Boolean);

  return badges.length === 0 ? "" : `<div class="at-badges">${badges.join("")}</div>`;
}

function renderHeaderSection(detail: ProjectDetail, context: PageContext): string {
  const summary = detail.summary ? `<p class="at-hero-body">${renderText(detail.summary)}</p>` : "";

  return `
  <section data-project-part="header" class="at-project-head">
    <div class="at-wrap at-narrow">
      ${renderBackLink(detail, context)}
      ${renderBadges(detail)}
      <h1 class="at-hero-title">${renderText(detail.title)}</h1>
      ${summary}
    </div>
  </section>`;
}

function renderCoverSection(detail: ProjectDetail): string {
  return `
  <section data-project-part="cover" class="at-sec at-sec-tight">
    <div class="at-wrap">
      <div class="at-cover at-ratio-wide">${renderImage(detail.cover, "")}</div>
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
          <dt class="at-caps">${renderText(fact.label)}</dt>
          <dd class="at-fact-value">${renderText(fact.value)}</dd>
        </div>`,
    )
    .join("");

  return `
  <section data-project-part="facts" class="at-sec at-tint at-sec-tight">
    <dl class="at-wrap at-facts">${rows}
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
        <div class="at-reveal">
          <h2 class="at-title at-title-sm">${renderText(step.heading)}</h2>
          <p class="at-body">${renderText(step.body)}</p>
        </div>`,
    )
    .join("");

  return `
  <section data-project-part="story" class="at-sec">
    <div class="at-wrap at-narrow at-story">${steps}
    </div>
  </section>`;
}

function renderPhotoGroup(title: string, images: Image[], part: string): string {
  if (images.length === 0) {
    return "";
  }

  const photos = images
    .map((image) => `<div class="at-cover at-ratio-wide at-reveal">${renderImage(image, "")}</div>`)
    .join("\n        ");

  return `
  <section data-project-part="${part}" class="at-sec at-sec-tight">
    <div class="at-wrap">
      <h2 class="at-title at-title-sm at-reveal">${renderText(title)}</h2>
      <div class="at-photo-grid">
        ${photos}
      </div>
    </div>
  </section>`;
}

function renderCtaSection(detail: ProjectDetail, context: PageContext): string {
  const askHref = escapeAttribute(pageHref(context, detail.ask.href));
  const href = escapeAttribute(pageHref(context, detail.cta.href));

  return `
  <section data-project-part="cta" class="at-sec at-tint">
    <div class="at-wrap at-actions at-actions-center">
      <a href="${askHref}" data-project-ask class="at-btn at-btn-solid">${renderText(detail.ask.label)}${arrow}</a>
      <a href="${href}" class="at-btn at-btn-line">${renderText(detail.cta.label)}</a>
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
