import type { Image } from "../../blocks/common";
import type { ProjectDetail } from "../../content/project-pages";
import { escapeAttribute, renderText } from "../../content/html";
import type { PageContext } from "../types";
import { pageHref, renderImage, sectionPadding } from "./parts";

function renderBackLink(detail: ProjectDetail, context: PageContext): string {
  if (!detail.backLink) {
    return "";
  }

  const href = escapeAttribute(pageHref(context, detail.backLink.href));

  return `<a href="${href}" class="inline-flex items-center gap-2 mb-8 text-[11px] uppercase tracking-[0.2em] text-brass link-underline"><i data-lucide="arrow-left" class="w-3.5 h-3.5 rtl:rotate-180"></i> ${renderText(detail.backLink.label)}</a>`;
}

function renderBadges(detail: ProjectDetail): string {
  const badges = [
    detail.category
      ? `<span class="text-[11px] uppercase tracking-[0.2em] text-brass">${renderText(detail.category)}</span>`
      : "",
    detail.status ? `<span class="project-status project-status-inline">${renderText(detail.status)}</span>` : "",
  ].filter(Boolean);

  return badges.length === 0 ? "" : `<div class="flex flex-wrap items-center gap-4 mb-5">${badges.join("")}</div>`;
}

function renderHeaderSection(detail: ProjectDetail, context: PageContext): string {
  const summary = detail.summary
    ? `<p class="mt-6 text-lg text-white/60 leading-relaxed max-w-2xl">${renderText(detail.summary)}</p>`
    : "";

  return `
  <section data-project-part="header" class="bg-charcoal text-cream pt-36 pb-16 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      ${renderBackLink(detail, context)}
      ${renderBadges(detail)}
      <h1 class="font-display text-5xl md:text-6xl leading-tight">${renderText(detail.title)}</h1>
      ${summary}
    </div>
  </section>`;
}

function renderCoverSection(detail: ProjectDetail): string {
  return `
  <section data-project-part="cover" class="bg-charcoal px-6 md:px-10 lg:px-16 pb-16">
    <div class="max-w-7xl mx-auto">
      <div class="frame-3x2">${renderImage(detail.cover, "")}</div>
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
          <dt class="text-[11px] uppercase tracking-[0.2em] text-gray-500">${renderText(fact.label)}</dt>
          <dd class="mt-1 font-display text-2xl">${renderText(fact.value)}</dd>
        </div>`,
    )
    .join("");

  return `
  <section data-project-part="facts" class="bg-cream text-charcoal py-12 px-6 md:px-10 lg:px-16 border-b border-charcoal/10">
    <dl class="max-w-7xl mx-auto project-facts">${rows}
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
        <div class="reveal">
          <h2 class="font-display text-3xl">${renderText(step.heading)}</h2>
          <p class="mt-4 text-gray-600 leading-relaxed">${renderText(step.body)}</p>
        </div>`,
    )
    .join("");

  return `
  <section data-project-part="story" class="bg-cream text-charcoal ${sectionPadding}">
    <div class="max-w-3xl mx-auto space-y-12">${steps}
    </div>
  </section>`;
}

function renderPhotoGroup(title: string, images: Image[], part: string): string {
  if (images.length === 0) {
    return "";
  }

  const photos = images
    .map((image) => `<div class="frame-3x2 img-zoom reveal">${renderImage(image, "")}</div>`)
    .join("\n        ");

  return `
  <section data-project-part="${part}" class="bg-cream text-charcoal pb-16 px-6 md:px-10 lg:px-16">
    <div class="max-w-7xl mx-auto">
      <h2 class="font-display text-3xl mb-8 reveal">${renderText(title)}</h2>
      <div class="grid gap-4 md:grid-cols-2">
        ${photos}
      </div>
    </div>
  </section>`;
}

function renderCtaSection(detail: ProjectDetail, context: PageContext): string {
  const href = escapeAttribute(pageHref(context, detail.cta.href));

  return `
  <section data-project-part="cta" class="bg-charcoal text-cream ${sectionPadding}">
    <div class="max-w-7xl mx-auto text-center">
      <a href="${href}" class="inline-flex items-center gap-3 bg-brass text-charcoal text-[11px] uppercase tracking-[0.2em] px-8 py-4 transition hover:bg-cream">${renderText(detail.cta.label)} <i data-lucide="arrow-right" class="w-4 h-4 rtl:rotate-180"></i></a>
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
