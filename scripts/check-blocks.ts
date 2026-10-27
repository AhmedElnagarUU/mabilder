import { siteContentSchema } from "../src/features/static-site-generator/site-content";
import type { Locale } from "../src/features/static-site-generator/locale";
import { blockDefinitions } from "../src/features/static-site-generator/blocks/catalog";
import type { Facts } from "../src/features/static-site-generator/blocks/facts";

type AnyBlockDefinition = (typeof blockDefinitions)[number];

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

function checkFixture(
  definition: AnyBlockDefinition,
  fixture: "full" | "minimal",
): void {
  const label = `${definition.type} fixture:${fixture}`;
  const result = definition.schema.safeParse(definition.fixtures[fixture]);

  if (result.success) {
    pass(label);
    return;
  }

  fail(
    label,
    result.error.issues.map(
      (issue) => `${issue.path.join(".") || "props"}: ${issue.message}`,
    ),
  );
}

const facts: Facts = {
  businessName: "Agenvo",
  industry: "Architecture, engineering and interiors",
  email: "hello@agenvo.com",
  phone: "+41 44 123 4567",
  website: "https://agenvo.com",
  address: "Bahnhofstrasse 42, 8001 Zürich, Switzerland",
  yearsInBusiness: 18,
  projectCount: 180,
  services: ["Architecture", "Engineering", "Interiors"],
  clients: ["Meridian Holdings", "Kant Immobilien", "Fondazione Lago"],
  awards: [
    {
      year: "2025",
      title: "RIBA International Prize — Shortlist, Corporate Tower",
    },
  ],
  projects: [
    {
      title: "Corporate Tower",
      category: "Commercial",
      location: "Dubai, UAE",
      year: "2024",
      description:
        "A 48-storey headquarters designed around a public sky lobby.",
      images: [
        {
          src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=80",
          alt: "Corporate Tower Dubai",
        },
      ],
    },
  ],
  team: [
    {
      name: "Elena Marchetti",
      role: "Founding Partner, Architecture",
      bio: "Trained in Milan and Zurich, Elena leads design across the studio's cultural and residential work.",
      image: {
        src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&q=80",
        alt: "Elena Marchetti",
      },
    },
  ],
  testimonials: [
    {
      quote:
        "Agenvo showed us that the most sustainable building on the site was the one we were about to knock down.",
      author: "Martin Keller",
      company: "Kant Immobilien",
    },
  ],
};

function localize<Value>(
  value: Value,
  locales: Locale[],
): Record<string, Value> {
  return Object.fromEntries(locales.map((locale) => [locale, value]));
}

function buildSampleContent(
  locales: Locale[],
  defaultLocale: Locale,
  missingBlockLocale?: Locale,
): unknown {
  const blocks = blockDefinitions.map((definition, index) => {
    const props = localize(definition.fixtures.full, locales);

    if (index === 0 && missingBlockLocale !== undefined) {
      delete props[missingBlockLocale];
    }

    return {
      id: `index-${definition.type}`,
      type: definition.type,
      variant: definition.variants[0],
      hidden: false,
      props,
    };
  });

  return {
    theme: "agenvo",
    locales,
    defaultLocale,
    facts,
    nav: localize(
      {
        items: [
          { label: "Home", href: "index.html" },
          { label: "About", href: "about.html" },
          { label: "Services", href: "services.html" },
          { label: "Projects", href: "projects.html" },
          { label: "Contact", href: "contact.html" },
        ],
        cta: { label: "Inquire", href: "contact.html" },
        menuLabel: "Menu",
        languageLabel: "Language",
      },
      locales,
    ),
    footer: localize(
      {
        blurb:
          "Architecture, engineering and interiors for those who build legacies, not just buildings.",
        copyright: "© 2026 Agenvo. All rights reserved.",
        photoCreditLabel: "Photo credits",
      },
      locales,
    ),
    pages: [
      {
        id: "index",
        slug: "index",
        meta: localize(
          {
            title: "Agenvo",
            description:
              "Architecture, engineering and interiors from Zurich and Dubai.",
          },
          locales,
        ),
        blocks,
      },
    ],
  };
}

function checkSiteContent(
  label: string,
  content: unknown,
  expectation: "pass" | "fail",
): void {
  const result = siteContentSchema.safeParse(content);
  const matched = result.success === (expectation === "pass");

  if (matched) {
    pass(`${label} (expected ${expectation})`);
    return;
  }

  const messages = result.success
    ? ["Expected validation to fail."]
    : result.error.issues.map(
        (issue) => `${issue.path.join(".") || "content"}: ${issue.message}`,
      );

  fail(`${label} (expected ${expectation})`, messages);
}

for (const definition of blockDefinitions) {
  checkFixture(definition, "full");
  checkFixture(definition, "minimal");

  const label = `${definition.type} variants`;

  if (definition.variants.length > 0) {
    pass(label);
  } else {
    fail(label, ["variants must contain at least one value."]);
  }
}

checkSiteContent(
  "site content locales:[en]",
  buildSampleContent(["en"], "en"),
  "pass",
);

checkSiteContent(
  "site content locales:[ar]",
  buildSampleContent(["ar"], "ar"),
  "pass",
);

checkSiteContent(
  "site content locales:[en,ar]",
  buildSampleContent(["en", "ar"], "en"),
  "pass",
);

checkSiteContent(
  "site content locales:[en,ar] block missing ar",
  buildSampleContent(["en", "ar"], "en", "ar"),
  "fail",
);

checkSiteContent(
  "site content defaultLocale:ar not in locales:[en]",
  buildSampleContent(["en"], "ar"),
  "fail",
);

if (failureCount > 0) {
  console.log(`${failureCount} check(s) failed.`);
  process.exitCode = 1;
} else {
  console.log("All block checks passed.");
}
