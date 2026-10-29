import { factsSchema, type Facts } from "../static-site-generator/blocks/facts";
import { splitLines, splitList } from "./text";
import type { BusinessBrief } from "./types";

function parsePositiveInteger(value: string | undefined): number | undefined {
  const match = (value ?? "").match(/\d+/);
  const number = match ? Number(match[0]) : 0;
  return number > 0 ? number : undefined;
}

function parseAwards(value: string | undefined): Facts["awards"] {
  return splitLines(value).flatMap((line) => {
    const match = line.match(/^(\d{4})\s*[-–—:]\s*(.+)$/);
    return match ? [{ year: match[1], title: match[2].trim() }] : [];
  });
}

export function buildFacts(
  brief: BusinessBrief,
  projects: Facts["projects"] = [],
): Facts {
  return factsSchema.parse({
    businessName: brief.businessName,
    industry: brief.industry,
    email: brief.email,
    phone: brief.phone,
    website: brief.website,
    address: brief.location,
    yearsInBusiness: parsePositiveInteger(brief.yearsInBusiness),
    projectCount: parsePositiveInteger(brief.projectCount),
    services: splitList(brief.services),
    clients: splitList(brief.notableClients),
    awards: parseAwards(brief.awards),
    projects,
    team: [],
    testimonials: [],
  });
}
