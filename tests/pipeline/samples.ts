import type { Facts } from "../../src/features/static-site-generator/blocks/facts";
import type { Locale } from "../../src/features/static-site-generator/locale";
import type { SiteContent } from "../../src/features/static-site-generator/site-content";
import { composeSite } from "../../src/features/site-creation/composition/compose";
import { buildFacts } from "../../src/features/site-creation/facts";
import { businessBriefSchema } from "../../src/features/site-creation/types";

export const thinBrief = {
  businessName: "Nour Studio",
  industry: "Interior design",
  description: "A small interior design studio.",
};

export const richBrief = {
  businessName: "Agenvo",
  industry: "Architecture, engineering and interiors",
  description: "An architecture and engineering practice.",
  services: "Architecture, Engineering, Interiors, Landscape",
  location: "Bahnhofstrasse 42, 8001 Zürich, Switzerland",
  email: "hello@agenvo.com",
  phone: "+41 44 123 4567",
  website: "agenvo.com",
  yearsInBusiness: "18 years",
  projectCount: "180+",
  awards: "2025 - RIBA International Prize\n2023: Swiss Architecture Award",
  notableClients: "Meridian Holdings, Kant Immobilien, Fondazione Lago, Nord Atelier",
};

export const richProjects: Facts["projects"] = [
  {
    title: "Corporate Tower",
    category: "Commercial",
    location: "Dubai, UAE",
    year: "2024",
    description: "A 48-storey headquarters designed around a public sky lobby.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80",
        alt: "Corporate Tower",
      },
    ],
  },
];

export function factsFor(brief: Record<string, string>, projects: Facts["projects"] = []): Facts {
  return buildFacts(businessBriefSchema.parse(brief), projects);
}

export function composeFor(
  brief: Record<string, string>,
  projects: Facts["projects"] = [],
  locales: Locale[] = ["en"],
): SiteContent {
  return composeSite({
    theme: "agenvo",
    locales,
    defaultLocale: locales[0],
    facts: factsFor(brief, projects),
    currentYear: 2026,
  });
}

export function pageSlugs(content: SiteContent): string[] {
  return content.pages.map((page) => page.slug);
}

export function blockIds(content: SiteContent): string[] {
  return content.pages.flatMap((page) => page.blocks.map((block) => block.id));
}
