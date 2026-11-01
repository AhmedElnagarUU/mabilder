import { projectInLocale, projectSlugs } from "../static-site-generator/content/project-pages";
import { siteContentSchema } from "../static-site-generator/site-content";
import { getPreviewPath } from "../static-site-generator/site-paths";
import { findSiteContent } from "./repository";

export type SiteProject = { slug: string; title: string; href: string };

// The projects of the stored website, with the same slugs the project pages use.
export async function listSiteProjects(siteId: string): Promise<SiteProject[]> {
  const parsed = siteContentSchema.safeParse(await findSiteContent(siteId));

  if (!parsed.success) {
    return [];
  }

  const { facts, locales, defaultLocale } = parsed.data;
  const slugs = projectSlugs(facts.projects);
  const folder = locales.length > 1 ? `${defaultLocale}/projects` : "projects";

  return facts.projects.map((project, index) => ({
    slug: slugs[index],
    title: projectInLocale(project, defaultLocale).title,
    href: getPreviewPath(siteId, `${folder}/${slugs[index]}.html`),
  }));
}

// A slug that is not a project of this site is dropped; the request is still saved.
export function matchProjectSlug(projects: SiteProject[], slug: string | undefined): string | undefined {
  return projects.find((project) => project.slug === slug)?.slug;
}
