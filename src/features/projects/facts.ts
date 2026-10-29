import type { Facts } from "../static-site-generator/blocks/facts";
import type { Locale } from "../static-site-generator/locale";
import type { Project } from "./types";

type FactProject = Facts["projects"][number];

type ProjectText = {
  title?: string;
  category?: string;
  location?: string;
  description?: string;
};

function textIn(project: Project, locale: Locale): ProjectText {
  return {
    title: project.title[locale],
    category: project.category?.[locale],
    location: project.location?.[locale],
    description: project.description?.[locale],
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
    images: project.photos.map((photo) => ({ src: photo.url, alt: photo.alt || title })),
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
