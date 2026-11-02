import type { Image } from "../../blocks/common";
import { escapeAttribute, renderText } from "../../content/html";
import type { ProjectDetail } from "../../content/project-pages";
import { pageHref, renderImage } from "../agenvo/parts";
import type { PageContext } from "../types";

const arrow =
  '<svg class="ar-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true" focusable="false"><path d="M2 8h12M9 3l5 5-5 5"/></svg>';

function renderBackLink(detail: ProjectDetail, context: PageContext): string {
  if (!detail.backLink) {
    return "";
  }

  const href = escapeAttribute(pageHref(context, detail.backLink.href));

  return `<a href="${href}" class="ar-link ar-back">${arrow}${renderText(detail.backLink.label)}</a>`;
}

function renderBadges(detail: ProjectDetail): string {
  const badges = [
    detail.category ? `<span class="ar-caps-inline">${renderText(detail.category)}</span>` : "",
    detail.status ? `<span class="ar-status ar-status-inline">${renderText(detail.status)}</span>` : "",
  ].filter(Boolean);

  return badges.join("");
}

function renderHeaderSection(detail: ProjectDetail, context: PageContext): string {
  const summary = detail.summary ? `<p class="ar-hero-body">${renderText(detail.summary)}</p>` : "";

  return `
  <section data-project-part="header" class="ar-project-head">
    <div class="ar-wrap">
      ${renderBackLink(detail, context)}
      ${detail.category || detail.status ? `<div class="ar-badges">${renderBadges(detail)}</div>` : ""}
      <h1 class="ar-hero-title">${renderText(detail.title)}</h1>
      ${summary}
    </div>
  </section>`;
}

function renderCoverSection(detail: ProjectDetail): string {
  return `
  <section data-project-part="cover" class="ar-sec ar-sec-tight">
    <div class="ar-wrap">
      <div class="ar-item-cover ar-ratio-wide">${renderImage(detail.cover, "ar-photo")}</div>
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
        <div class="ar-stat">
          <dt class="ar-caps">${renderText(fact.label)}</dt>
          <dd class="ar-fact-value">${renderText(fact.value)}</dd>
        </div>`,
    )
    .join("");

  return `
  <section data-project-part="facts" class="ar-sec ar-band ar-sec-tight">
    <dl class="ar-wrap ar-facts">${rows}
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
      <div class="ar-story-step ar-reveal">
        <div>
          <h2 class="ar-title ar-title-sm">${renderText(step.heading)}</h2>
          <p class="ar-body">${renderText(step.body)}</p>
        </div>
      </div>`,
    )
    .join("");

  return `
  <section data-project-part="story" class="ar-sec">
    <div class="ar-wrap ar-narrow ar-story">${steps}
    </div>
  </section>`;
}

function renderPhotoGroup(title: string, images: Image[], part: string): string {
  if (images.length === 0) {
    return "";
  }

  const photos = images
    .map((image) => `<div class="ar-item-cover ar-ratio-wide">${renderImage(image, "ar-photo")}</div>`)
    .join("\n        ");

  return `
  <section data-project-part="${part}" class="ar-sec ar-sec-tight">
    <div class="ar-wrap">
      <div class="ar-head">
        <h2 class="ar-title ar-title-sm ar-reveal">${renderText(title)}</h2>
      </div>
      <div class="ar-photo-grid">
        ${photos}
      </div>
    </div>
  </section>`;
}

function renderCtaSection(detail: ProjectDetail, context: PageContext): string {
  const askHref = escapeAttribute(pageHref(context, detail.ask.href));
  const href = escapeAttribute(pageHref(context, detail.cta.href));

  return `
  <section data-project-part="cta" class="ar-sec ar-cta">
    <div class="ar-wrap">
      <div class="ar-actions">
        <a href="${askHref}" data-project-ask class="ar-btn ar-btn-solid">${renderText(detail.ask.label)}${arrow}</a>
        <a href="${href}" class="ar-btn">${renderText(detail.cta.label)}</a>
      </div>
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
