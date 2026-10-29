import { isDeepStrictEqual } from "node:util";
import type { Facts } from "../src/features/static-site-generator/blocks/facts";
import type { Locale } from "../src/features/static-site-generator/locale";
import { renderSite } from "../src/features/static-site-generator/render-site";
import {
  siteContentSchema,
  type SiteContent,
} from "../src/features/static-site-generator/site-content";
import { composeSite } from "../src/features/site-creation/composition/compose";
import { buildFacts } from "../src/features/site-creation/facts";
import { businessBriefSchema } from "../src/features/site-creation/types";

type Sample = {
  name: string;
  brief: Record<string, string>;
  projects: Facts["projects"];
  locales: Locale[];
  expected: Record<string, string[]>;
};

const currentYear = 2026;
const forbiddenOutput = ["undefined", "[object Object]"];

let failureCount = 0;

function pass(label: string): void {
  console.log(`PASS ${label}`);
}

function fail(label: string, messages: string[]): void {
  failureCount += 1;
  console.log(`FAIL ${label}`);

  for (const message of messages) {
    console.log(`     ${message}`);
  }
}

function check(label: string, ok: boolean, messages: string[]): void {
  if (ok) {
    pass(label);
  } else {
    fail(label, messages);
  }
}

const thinSample: Sample = {
  name: "thin",
  brief: {
    businessName: "Nour Studio",
    industry: "Interior design",
    description: "A small interior design studio.",
  },
  projects: [],
  locales: ["en"],
  expected: {
    index: [
      "index-hero-1:text-only",
      "index-marquee-1:default",
      "index-intro-1:quote",
      "index-services-1:columns",
      "index-process-1:default",
      "index-cta-1:dark",
    ],
    services: [
      "services-hero-1:text-only",
      "services-services-1:list",
      "services-process-1:default",
      "services-faq-1:default",
      "services-cta-1:dark",
    ],
    contact: [
      "contact-hero-1:text-only",
      "contact-contact-1:form-only",
      "contact-faq-1:default",
    ],
  },
};

const richSample: Sample = {
  name: "rich",
  brief: {
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
  },
  projects: [
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
    {
      title: "Water Pavilion",
      images: [
        {
          src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
          alt: "Water Pavilion",
        },
      ],
    },
  ],
  locales: ["en", "ar"],
  expected: {
    index: [
      "index-hero-1:text-only",
      "index-marquee-1:default",
      "index-stats-1:dark",
      "index-intro-1:quote",
      "index-projects-1:featured",
      "index-services-1:columns",
      "index-process-1:default",
      "index-clients-1:default",
      "index-cta-1:dark",
    ],
    about: [
      "about-hero-1:text-only",
      "about-intro-1:quote",
      "about-values-1:default",
      "about-timeline-1:default",
      "about-awards-1:default",
      "about-cta-1:dark",
    ],
    services: [
      "services-hero-1:text-only",
      "services-services-1:list",
      "services-feature-split-1:image-right",
      "services-feature-split-2:image-left",
      "services-feature-split-3:image-right",
      "services-process-1:default",
      "services-faq-1:default",
      "services-cta-1:dark",
    ],
    projects: [
      "projects-hero-1:text-only",
      "projects-projects-1:grid",
      "projects-stats-1:dark",
      "projects-clients-1:default",
      "projects-cta-1:dark",
    ],
    contact: [
      "contact-hero-1:text-only",
      "contact-contact-1:form-only",
      "contact-location-1:default",
      "contact-faq-1:default",
    ],
  },
};

function summarizePages(content: SiteContent): Record<string, string[]> {
  return Object.fromEntries(
    content.pages.map((page) => [
      page.slug,
      page.blocks.map((block) => `${block.id}:${block.variant}`),
    ]),
  );
}

function printPages(name: string, summary: Record<string, string[]>): void {
  console.log(`--- ${name} brief: ${Object.keys(summary).join(", ")}`);

  for (const [slug, blocks] of Object.entries(summary)) {
    console.log(`    ${slug}: ${blocks.join(" · ")}`);
  }
}

function compose(sample: Sample, facts: Facts): SiteContent {
  return composeSite({
    theme: "agenvo",
    locales: sample.locales,
    defaultLocale: sample.locales[0],
    facts,
    currentYear,
  });
}

function checkRender(label: string, content: SiteContent): void {
  try {
    const problems = renderSite(content).flatMap((file) =>
      forbiddenOutput
        .filter((text) => file.html.includes(text))
        .map((text) => `${file.fileName} contains "${text}"`),
    );
    check(`${label} renders`, problems.length === 0, problems);
  } catch (error) {
    fail(`${label} renders`, [error instanceof Error ? error.message : String(error)]);
  }
}

function checkSample(sample: Sample): void {
  const label = `${sample.name} brief`;
  const brief = businessBriefSchema.parse(sample.brief);
  const facts = buildFacts(brief, sample.projects);
  const first = compose(sample, facts);
  const second = compose(sample, buildFacts(brief, sample.projects));
  const summary = summarizePages(first);

  printPages(sample.name, summary);

  check(`${label} matches recipes`, isDeepStrictEqual(summary, sample.expected), [
    `expected ${JSON.stringify(sample.expected)}`,
    `got      ${JSON.stringify(summary)}`,
  ]);
  check(`${label} is stable across runs`, isDeepStrictEqual(first, second), [
    "Two runs produced different content.",
  ]);
  check(`${label} keeps facts unchanged`, isDeepStrictEqual(first.facts, facts), [
    "content.facts differs from buildFacts output.",
  ]);

  const result = siteContentSchema.safeParse(first);
  check(
    `${label} validates`,
    result.success,
    result.success
      ? []
      : result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
  );

  checkRender(label, first);
}

function runSample(sample: Sample): void {
  try {
    checkSample(sample);
  } catch (error) {
    fail(`${sample.name} brief`, [error instanceof Error ? error.message : String(error)]);
  }
}

runSample(thinSample);
runSample(richSample);

if (failureCount > 0) {
  console.log(`${failureCount} check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log("All composition checks passed.");
}
