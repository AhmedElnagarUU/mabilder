import {
  siteContentSchema,
  type SiteContent,
} from "../static-site-generator/content/types";
import { baseContentTemplate } from "../static-site-generator/content/base-content";
import {
  splitLines,
  splitList,
  toEmailHref,
  toFilterValue,
  toMapsHref,
  toTelHref,
  toWebsiteHref,
} from "./text";
import type { BusinessBrief } from "./types";

function buildSocialLinks(
  brief: BusinessBrief,
): SiteContent["footer"]["social"] {
  const links: SiteContent["footer"]["social"] = [];

  if (brief.website) {
    links.push({
      label: "Website",
      href: toWebsiteHref(brief.website),
      icon: "globe",
    });
  }

  if (brief.email) {
    links.push({
      label: "Email",
      href: toEmailHref(brief.email),
      icon: "mail",
    });
  }

  if (brief.phone) {
    links.push({
      label: "Phone",
      href: toTelHref(brief.phone),
      icon: "phone",
    });
  }

  return links;
}

function buildAwards(
  value: string | undefined,
): SiteContent["pages"]["about"]["awards"]["items"] {
  return splitLines(value)
    .slice(0, 6)
    .map((item) => {
      const match = item.match(/^(\d{4})\s*[-–—:]\s*(.+)$/);

      if (match) {
        return { year: match[1], title: match[2] };
      }

      return { year: "", title: item };
    });
}

function buildTimeline(
  value: string | undefined,
): SiteContent["pages"]["about"]["timeline"]["items"] {
  const match = (value ?? "").match(/\d+/);
  const years = match ? Number(match[0]) : 0;

  if (years <= 0) {
    return [];
  }

  const currentYear = new Date().getFullYear();
  const startYear = currentYear - years;

  if (years <= 1) {
    return [{ year: String(currentYear), title: "Today", body: "" }];
  }

  if (years <= 3) {
    return [
      { year: String(startYear), title: "Founded", body: "" },
      { year: String(currentYear), title: "Today", body: "" },
    ];
  }

  return [
    { year: String(startYear), title: "Founded", body: "" },
    {
      year: String(startYear + Math.floor(years / 2)),
      title: "Growing",
      body: "",
    },
    { year: String(currentYear), title: "Today", body: "" },
  ];
}

function applyTimeline(content: SiteContent, brief: BusinessBrief): void {
  const previous = content.pages.about.timeline.items;

  content.pages.about.timeline.items = buildTimeline(
    brief.yearsInBusiness,
  ).map((item, index) => ({
    ...item,
    body: previous[index]?.body ?? "",
  }));
}

function applyFacts(content: SiteContent, brief: BusinessBrief): void {
  const years = brief.yearsInBusiness;
  const projects = brief.projectCount;

  const groups = [
    content.pages.home.stats,
    content.pages.about.hero.facts,
    content.pages.about.intro.stats,
    content.pages.profile.facts,
    content.pages.work.hero.facts,
    content.pages.work.numbers.stats,
  ];

  for (const group of groups) {
    if (years && group[0]) {
      group[0] = { value: years, label: "Years in practice" };
    }

    if (projects && group[1]) {
      group[1] = { value: projects, label: "Projects delivered" };
    }
  }

  if (brief.location && content.pages.profile.facts[2]) {
    content.pages.profile.facts[2] = {
      value: brief.location,
      label: "Based in",
    };
  }
}

function applyContact(content: SiteContent, brief: BusinessBrief): void {
  const email = brief.email ?? "";
  const phone = brief.phone ?? "";
  const location = brief.location ?? "";

  content.footer.social = buildSocialLinks(brief);
  content.footer.studios = [
    {
      lines: [location || "Location on request"],
      email,
      phone,
      phoneHref: toTelHref(brief.phone),
    },
  ];

  content.pages.home.contact.email = email || "Available on request";
  content.pages.home.contact.phone = phone || "Available on request";
  content.pages.home.contact.address = location || "Location on request";

  const methods = [
    {
      value: email || "Use the form",
      href: toEmailHref(brief.email),
    },
    {
      value: phone || "Contact us",
      href: toTelHref(brief.phone),
    },
    {
      value: location || "Contact us",
      href: toMapsHref(brief.location),
    },
  ];

  content.pages.contact.methods = content.pages.contact.methods.map(
    (method, index) => ({
      ...method,
      ...methods[index],
    }),
  );

  content.pages.contact.enquiry.email = email || "Use the form above";

  const officeTemplate = baseContentTemplate.pages.contact.offices.items[0];
  const previousOffice = content.pages.contact.offices.items[0];

  content.pages.contact.offices.items = [
    {
      ...officeTemplate,
      image: previousOffice?.image ?? officeTemplate.image,
      tag: "Studio",
      city: location || "Studio",
      timezone: "",
      address: location ? [location] : [],
      phone,
      phoneHref: toTelHref(brief.phone),
      email,
      directions: location ? "Visits by appointment." : "",
      mapLabel: location ? "Open in maps" : "Contact us",
      mapHref: toMapsHref(brief.location),
    },
  ];

  content.pages.contact.departments.items =
    content.pages.contact.departments.items.map((item) => ({
      ...item,
      email,
    }));

  content.pages.profile.careers.email = email;
}

function normalizeWorkFilters(content: SiteContent): void {
  const filters = content.pages.work.grid.filters;

  filters[0] = { label: "All", value: "all" };

  filters.slice(1).forEach((filter, index) => {
    filter.value = toFilterValue(filter.label) || `category-${index + 1}`;
  });

  const categories = filters
    .slice(1)
    .map((filter) => filter.label)
    .filter(Boolean);
  const fallback = categories[0] ?? "";

  for (const project of content.pages.work.grid.items) {
    const current = (project.category ?? "").toLowerCase();
    const match = categories.find(
      (category) => category.toLowerCase() === current,
    );

    project.category = match ?? fallback;
  }
}

function applyBriefData(
  content: SiteContent,
  brief: BusinessBrief,
): SiteContent {
  content.site.name = brief.businessName;

  content.pages.about.awards.items = buildAwards(brief.awards);
  content.pages.work.clients.names = splitList(brief.notableClients).slice(
    0,
    8,
  );
  content.pages.profile.careers.items = [];

  applyTimeline(content, brief);
  applyFacts(content, brief);
  applyContact(content, brief);

  content.pages.work.grid.filters[0] = { label: "All", value: "all" };

  return content;
}

export function buildBaseContent(brief: BusinessBrief): SiteContent {
  return applyBriefData(structuredClone(baseContentTemplate), brief);
}

export function finalizeContent(
  content: SiteContent,
  brief: BusinessBrief,
): SiteContent {
  const applied = applyBriefData(content, brief);
  normalizeWorkFilters(applied);

  return siteContentSchema.parse(applied);
}
