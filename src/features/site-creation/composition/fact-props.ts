import { awardsBlock, type AwardsProps } from "../../static-site-generator/blocks/awards";
import type { BlockType } from "../../static-site-generator/blocks/catalog";
import { clientsBlock, type ClientsProps } from "../../static-site-generator/blocks/clients";
import type { Stat } from "../../static-site-generator/blocks/common";
import type { Facts } from "../../static-site-generator/blocks/facts";
import { locationBlock, type LocationProps } from "../../static-site-generator/blocks/location";
import { projectsBlock, type ProjectsProps } from "../../static-site-generator/blocks/projects";
import { statsBlock, type StatsProps } from "../../static-site-generator/blocks/stats";
import { teamBlock, type TeamProps } from "../../static-site-generator/blocks/team";
import {
  testimonialsBlock,
  type TestimonialsProps,
} from "../../static-site-generator/blocks/testimonials";
import { timelineBlock, type TimelineProps } from "../../static-site-generator/blocks/timeline";
import { projectInLocale, projectSlugs } from "../../static-site-generator/content/project-pages";
import type { Locale } from "../../static-site-generator/locale";
import type { PageSlug } from "../../static-site-generator/site-content";
import { toMapsHref } from "../text";
import type { SiteLabels } from "./labels";
import { maxHomeProjects } from "./recipes";

export type FactContext = {
  facts: Facts;
  locale: Locale;
  labels: SiteLabels;
  currentYear: number;
  pageSlug: PageSlug;
  keptSlugs: PageSlug[];
};

function buildStatItems({ facts, labels }: FactContext): Stat[] {
  const items: Stat[] = [];

  if (facts.yearsInBusiness !== undefined) {
    items.push({ value: String(facts.yearsInBusiness), label: labels.yearsInBusiness });
  }

  if (facts.projectCount !== undefined) {
    items.push({ value: String(facts.projectCount), label: labels.projectCount });
  }

  if (facts.clients.length >= 3) {
    items.push({ value: String(facts.clients.length), label: labels.clients });
  }

  if (facts.awards.length >= 1) {
    items.push({ value: String(facts.awards.length), label: labels.awards });
  }

  return items;
}

function buildStatsProps(context: FactContext): StatsProps {
  return { title: statsBlock.fixtures.minimal.title, items: buildStatItems(context) };
}

function buildClientsProps({ facts }: FactContext): ClientsProps {
  return { title: clientsBlock.fixtures.minimal.title, names: facts.clients };
}

function buildAwardsProps({ facts }: FactContext): AwardsProps {
  return { title: awardsBlock.fixtures.minimal.title, items: facts.awards };
}

function buildTimelineProps({ facts, labels, currentYear }: FactContext): TimelineProps {
  const years = facts.yearsInBusiness ?? 0;

  return {
    title: timelineBlock.fixtures.minimal.title,
    items: [
      {
        year: String(currentYear - years),
        title: labels.founded,
        body: labels.foundedBody(facts.businessName),
      },
      { year: String(currentYear), title: labels.today, body: labels.todayBody(years) },
    ],
  };
}

type FactProject = Facts["projects"][number];

function buildProjectMeta(project: FactProject, facts: Facts): string {
  const parts = [project.location, project.year].filter(Boolean);
  return parts.length > 0 ? parts.join(" — ") : (project.category ?? facts.industry);
}

function listProjectsForPage({ facts, pageSlug }: FactContext): FactProject[] {
  if (pageSlug !== "index") {
    return facts.projects;
  }

  return facts.projects.filter((project) => project.showOnHome !== false);
}

function buildProjectItems(context: FactContext): ProjectsProps["items"] {
  const slugs = projectSlugs(context.facts.projects);
  const items = listProjectsForPage(context).flatMap((original) => {
    const project = projectInLocale(original, context.locale);
    const slug = slugs[context.facts.projects.indexOf(original)];

    return project.images.length === 0
      ? []
      : [
          {
            title: project.title,
            meta: buildProjectMeta(project, context.facts),
            category: project.category,
            status: project.status,
            body: project.description,
            href: `projects/${slug}.html`,
            image: project.images[0],
          },
        ];
  });

  return context.pageSlug === "index" ? items.slice(0, maxHomeProjects) : items;
}

function buildProjectsProps(context: FactContext): ProjectsProps | undefined {
  const items = buildProjectItems(context);

  if (items.length === 0) {
    return undefined;
  }

  const linksToProjectsPage =
    context.pageSlug !== "projects" && context.keptSlugs.includes("projects");

  return {
    title: projectsBlock.fixtures.minimal.title,
    items,
    link: linksToProjectsPage
      ? { label: context.labels.allProjects, href: "projects.html" }
      : undefined,
  };
}

function buildTeamProps({ facts }: FactContext): TeamProps | undefined {
  const items = facts.team.flatMap((member) =>
    member.bio === undefined
      ? []
      : [{ name: member.name, role: member.role, bio: member.bio, image: member.image }],
  );

  return items.length === 0 ? undefined : { title: teamBlock.fixtures.minimal.title, items };
}

function buildTestimonialsProps({ facts }: FactContext): TestimonialsProps {
  return { title: testimonialsBlock.fixtures.minimal.title, items: facts.testimonials };
}

function buildLocationProps({ facts }: FactContext): LocationProps {
  return {
    title: locationBlock.fixtures.minimal.title,
    address: facts.address ?? "",
    email: facts.email,
    phone: facts.phone,
    mapHref: toMapsHref(facts.address),
  };
}

export function buildFactProps(type: BlockType, context: FactContext): unknown {
  switch (type) {
    case "stats":
      return buildStatsProps(context);
    case "clients":
      return buildClientsProps(context);
    case "awards":
      return buildAwardsProps(context);
    case "timeline":
      return buildTimelineProps(context);
    case "projects":
      return buildProjectsProps(context);
    case "team":
      return buildTeamProps(context);
    case "testimonials":
      return buildTestimonialsProps(context);
    case "location":
      return buildLocationProps(context);
    default:
      throw new Error(`Block type "${type}" is not a fact block.`);
  }
}
