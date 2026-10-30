import type { Facts } from "../static-site-generator/blocks/facts";
import type { Locale } from "../static-site-generator/locale";
import { categoryLabels, statusLabels } from "./labels";
import type { LocalizedText, Project, ProjectPhoto } from "./types";

type FactProject = Facts["projects"][number];

type ProjectText = {
  title?: string;
  category?: string;
  status?: string;
  location?: string;
  description?: string;
  client?: string;
  duration?: string;
  challenge?: string;
  solution?: string;
  result?: string;
};

function pick(field: LocalizedText | undefined, locale: Locale): string | undefined {
  return field?.[locale];
}

function categoryIn(project: Project, locale: Locale): string | undefined {
  if (project.categoryKey && project.categoryKey !== "other") {
    return categoryLabels[locale][project.categoryKey];
  }

  return pick(project.category, locale);
}

function textIn(project: Project, locale: Locale): ProjectText {
  return {
    title: pick(project.title, locale),
    category: categoryIn(project, locale),
    status: project.status ? statusLabels[locale][project.status] : undefined,
    location: pick(project.location, locale),
    description: pick(project.description, locale),
    client: pick(project.client, locale),
    duration: pick(project.duration, locale),
    challenge: pick(project.challenge, locale),
    solution: pick(project.solution, locale),
    result: pick(project.result, locale),
  };
}

function hasText(text: ProjectText): boolean {
  return Object.values(text).some((value) => value !== undefined);
}

function toTranslations(project: Project, otherLocales: Locale[]): FactProject["translations"] {
  const entries = otherLocales
    .map((locale) => [locale, textIn(project, locale)] as const)
    .filter(([, text]) => hasText(text));

  return entries.length === 0 ? undefined : Object.fromEntries(entries);
}

function toImages(photos: ProjectPhoto[] | undefined, title: string): FactProject["images"] {
  return (photos ?? []).map((photo) => ({ src: photo.url, alt: photo.alt || title }));
}

function toFactProject(project: Project, locales: Locale[], defaultLocale: Locale): FactProject | null {
  const mainLocale = [defaultLocale, ...locales].find((locale) => project.title[locale]);

  if (!mainLocale) {
    return null;
  }

  const main = textIn(project, mainLocale);
  const title = main.title as string;

  return {
    ...main,
    title,
    year: project.year,
    area: project.area,
    scope: project.scope?.length ? project.scope : undefined,
    images: toImages(project.photos, title),
    beforeImages: project.beforePhotos?.length ? toImages(project.beforePhotos, title) : undefined,
    showOnHome: project.showOnHome,
    translations: toTranslations(
      project,
      locales.filter((locale) => locale !== mainLocale),
    ),
  };
}

// The first language is the site's default locale; projects are listed in their saved order.
export function toFactProjects(
  projects: Project[],
  locales: Locale[],
  defaultLocale: Locale,
): Facts["projects"] {
  return [...projects]
    .sort((first, second) => first.order - second.order)
    .flatMap((project) => toFactProject(project, locales, defaultLocale) ?? []);
}
