import type { Image, Link, Stat } from "../blocks/common";
import type { Facts } from "../blocks/facts";
import type { Locale } from "../locale";
import type { SiteContent } from "../site-content";

type FactProject = Facts["projects"][number];

export type ProjectDetail = {
  title: string;
  category?: string;
  status?: string;
  summary?: string;
  cover: Image;
  facts: Stat[];
  story: { heading: string; body: string }[];
  gallery: Image[];
  galleryTitle: string;
  before: Image[];
  beforeTitle: string;
  cta: Link;
  backLink?: Link;
};

export type ProjectPage = {
  slug: string;
  details: Partial<Record<Locale, ProjectDetail>>;
};

type PageLabels = {
  location: string;
  year: string;
  area: string;
  areaUnit: string;
  duration: string;
  client: string;
  scope: string;
  challenge: string;
  solution: string;
  result: string;
  gallery: string;
  before: string;
  after: string;
};

const pageLabels: Record<Locale, PageLabels> = {
  en: {
    location: "Location",
    year: "Year",
    area: "Area",
    areaUnit: "m²",
    duration: "Duration",
    client: "Client",
    scope: "Scope",
    challenge: "The challenge",
    solution: "Our solution",
    result: "The result",
    gallery: "Gallery",
    before: "Before",
    after: "After",
  },
  ar: {
    location: "الموقع",
    year: "السنة",
    area: "المساحة",
    areaUnit: "م²",
    duration: "المدة",
    client: "العميل",
    scope: "نطاق العمل",
    challenge: "التحدي",
    solution: "الحل",
    result: "النتيجة",
    gallery: "معرض الصور",
    before: "قبل",
    after: "بعد",
  },
};

// The second language is optional: every missing field falls back to the first language.
export function projectInLocale(project: FactProject, locale: Locale): FactProject {
  const translation = Object.fromEntries(
    Object.entries(project.translations?.[locale] ?? {}).filter(([, value]) => value !== undefined),
  );
  return { ...project, ...translation };
}

function toSlugBase(title: string, index: number): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");

  return base || `project-${index + 1}`;
}

// One slug per project, in the same order. The title is the first language's, so both
// languages share the slug. A repeated title gets -2, -3, ...
export function projectSlugs(projects: Facts["projects"]): string[] {
  const used = new Set<string>();

  return projects.map((project, index) => {
    const base = toSlugBase(project.title, index);
    let slug = base;

    for (let copy = 2; used.has(slug); copy += 1) {
      slug = `${base}-${copy}`;
    }

    used.add(slug);
    return slug;
  });
}

function buildFactRows(project: FactProject, labels: PageLabels): Stat[] {
  const rows: [string, string | undefined][] = [
    [labels.location, project.location],
    [labels.year, project.year],
    [labels.area, project.area === undefined ? undefined : `${project.area} ${labels.areaUnit}`],
    [labels.duration, project.duration],
    [labels.client, project.client],
    [labels.scope, project.scope?.length ? project.scope.join(", ") : undefined],
  ];

  return rows.flatMap(([label, value]) => (value ? [{ label, value }] : []));
}

function buildStory(project: FactProject, labels: PageLabels): ProjectDetail["story"] {
  const sections: [string, string | undefined][] = [
    [labels.challenge, project.challenge],
    [labels.solution, project.solution],
    [labels.result, project.result],
  ];

  return sections.flatMap(([heading, body]) => (body ? [{ heading, body }] : []));
}

function findLink(content: SiteContent, locale: Locale, href: string): Link | undefined {
  return content.nav[locale]?.items.find((item) => item.href === href);
}

function buildDetail(
  content: SiteContent,
  original: FactProject,
  locale: Locale,
): ProjectDetail | undefined {
  const project = projectInLocale(original, locale);
  const cta = content.nav[locale]?.cta;
  const [cover, ...gallery] = project.images;

  if (!cover || !cta) {
    return undefined;
  }

  const before = project.beforeImages ?? [];
  const labels = pageLabels[locale];

  return {
    title: project.title,
    category: project.category,
    status: project.status,
    summary: project.description,
    cover,
    facts: buildFactRows(project, labels),
    story: buildStory(project, labels),
    gallery,
    galleryTitle: before.length > 0 ? labels.after : labels.gallery,
    before,
    beforeTitle: labels.before,
    cta: cta.href === "#contact" ? { ...cta, href: "index.html#contact" } : cta,
    backLink: findLink(content, locale, "projects.html"),
  };
}

// A page for every project that has a photo (the same projects the cards show).
export function buildProjectPages(content: SiteContent): ProjectPage[] {
  const slugs = projectSlugs(content.facts.projects);

  return content.facts.projects.flatMap((project, index) => {
    const details = Object.fromEntries(
      content.locales.flatMap((locale) => {
        const detail = buildDetail(content, project, locale);
        return detail ? [[locale, detail]] : [];
      }),
    ) as ProjectPage["details"];

    return Object.keys(details).length === 0 ? [] : [{ slug: slugs[index], details }];
  });
}
