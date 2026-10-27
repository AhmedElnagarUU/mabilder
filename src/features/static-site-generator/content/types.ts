import { z } from "zod";
import { isSafeHref, isSafeImageUrl } from "./html";

const text = z.string();
const href = z
  .string()
  .refine(
    isSafeHref,
    "Use a generated page, anchor, mailto, tel, or http(s) link.",
  );
const imageUrl = z
  .string()
  .refine(isSafeImageUrl, "Use an http(s) image URL.");

const imageSchema = z.object({ src: imageUrl, alt: text });
const linkSchema = z.object({ label: text, href });
const metaSchema = z.object({ title: text, description: text });
const statSchema = z.object({ value: text, label: text });
const cardSchema = z.object({
  number: text.optional(),
  title: text,
  body: text,
  meta: text.optional(),
  icon: text.optional(),
});
const faqSchema = z.object({ question: text, answer: text });
const ctaSchema = z.object({
  eyebrow: text.optional(),
  title: text,
  body: text,
  primary: linkSchema,
  secondary: linkSchema.optional(),
});
const simpleFormSchema = z.object({
  namePlaceholder: text,
  emailPlaceholder: text,
  projectTypePlaceholder: text,
  messagePlaceholder: text,
  submitLabel: text,
  successMessage: text,
});
const projectSchema = z.object({
  title: text,
  meta: text,
  category: text.optional(),
  body: text.optional(),
  image: imageSchema,
  href: href.optional(),
});

const homePageSchema = z.object({
  meta: metaSchema,
  hero: z.object({
    eyebrow: text,
    title: text,
    body: text,
    image: imageSchema,
  }),
  marquee: z.array(text),
  stats: z.array(statSchema),
  studio: z.object({
    eyebrow: text,
    title: text,
    paragraphs: z.array(text),
    images: z.array(imageSchema),
    link: linkSchema,
  }),
  process: z.object({
    eyebrow: text,
    title: text,
    steps: z.array(cardSchema),
  }),
  projects: z.object({
    eyebrow: text,
    title: text,
    link: linkSchema,
    items: z.array(projectSchema),
  }),
  services: z.object({
    eyebrow: text,
    title: text,
    items: z.array(cardSchema),
  }),
  contact: z.object({
    eyebrow: text,
    title: text,
    body: text,
    email: text,
    phone: text,
    address: text,
    form: simpleFormSchema,
  }),
});

const aboutPageSchema = z.object({
  meta: metaSchema,
  hero: z.object({
    eyebrow: text,
    title: text,
    body: text,
    facts: z.array(statSchema),
    image: imageSchema,
  }),
  marquee: z.array(text),
  intro: z.object({
    eyebrow: text,
    title: text,
    quote: text,
    paragraphs: z.array(text),
    image: imageSchema,
    caption: text,
    stats: z.array(statSchema),
  }),
  beliefs: z.object({
    eyebrow: text,
    title: text,
    body: text,
    items: z.array(cardSchema),
  }),
  timeline: z.object({
    eyebrow: text,
    title: text,
    body: text,
    link: linkSchema,
    items: z.array(z.object({ year: text, title: text, body: text })),
  }),
  studioLife: z.object({
    eyebrow: text,
    title: text,
    body: text,
    items: z.array(
      z.object({ image: imageSchema, caption: text.optional() }),
    ),
  }),
  leadership: z.object({
    eyebrow: text,
    title: text,
    link: linkSchema,
    items: z.array(
      z.object({
        name: text,
        role: text,
        bio: text,
        image: imageSchema,
        href,
      }),
    ),
  }),
  awards: z.object({
    eyebrow: text,
    title: text,
    body: text,
    items: z.array(z.object({ year: text, title: text })),
  }),
  cta: ctaSchema,
});

const servicesPageSchema = z.object({
  meta: metaSchema,
  hero: z.object({
    eyebrow: text,
    title: text,
    body: text,
    image: imageSchema,
  }),
  index: z.array(z.object({ number: text, title: text, href })),
  architecture: z.object({
    eyebrow: text,
    title: text,
    paragraphs: z.array(text),
    stats: z.array(statSchema),
    points: z.array(text),
    images: z.array(imageSchema),
  }),
  engineering: z.object({
    eyebrow: text,
    title: text,
    paragraphs: z.array(text),
    stats: z.array(statSchema),
    points: z.array(text),
    image: imageSchema,
    link: linkSchema,
  }),
  interiors: z.object({
    eyebrow: text,
    title: text,
    body: text,
    cards: z.array(z.object({ title: text, body: text, image: imageSchema })),
    includesTitle: text,
    includes: z.array(text),
    audienceTitle: text,
    audience: z.array(text),
  }),
  advisory: z.object({
    eyebrow: text,
    title: text,
    body: text,
    items: z.array(cardSchema),
  }),
  process: z.object({
    eyebrow: text,
    title: text,
    body: text,
    steps: z.array(cardSchema),
  }),
  fees: z.object({
    eyebrow: text,
    title: text,
    body: text,
    link: linkSchema,
    items: z.array(cardSchema),
  }),
  faq: z.object({
    eyebrow: text,
    title: text,
    body: text,
    link: linkSchema,
    items: z.array(faqSchema),
  }),
  cta: ctaSchema,
});

const caseStudySchema = z.object({
  id: text,
  variant: z.enum(["dark", "split", "sand"]),
  eyebrow: text,
  title: text,
  intro: text,
  body: z.array(text).default([]),
  images: z.array(imageSchema).default([]),
  facts: z.array(z.object({ label: text, value: text })).default([]),
  blocks: z.array(z.object({ title: text, body: text })).default([]),
  stats: z.array(statSchema).default([]),
  quote: z.object({ text: text, author: text }).optional(),
});

const workPageSchema = z.object({
  meta: metaSchema,
  hero: z.object({
    eyebrow: text,
    title: text,
    body: text,
    facts: z.array(statSchema),
    image: imageSchema,
  }),
  marquee: z.array(text),
  featured: z.object({
    eyebrow: text,
    meta: text,
    title: text,
    body: text,
    image: imageSchema,
    facts: z.array(z.object({ label: text, value: text })),
    tags: z.array(text),
  }),
  grid: z.object({
    eyebrow: text,
    title: text,
    countLabel: text,
    filters: z.array(z.object({ label: text, value: text })),
    items: z.array(projectSchema),
  }),
  caseStudies: z.array(caseStudySchema),
  numbers: z.object({
    eyebrow: text,
    title: text,
    body: text,
    stats: z.array(statSchema),
  }),
  clients: z.object({
    eyebrow: text,
    title: text,
    body: text,
    names: z.array(text),
  }),
  cta: ctaSchema,
});

const personSchema = z.object({
  name: text,
  seniority: text.optional(),
  role: text,
  bio: text,
  image: imageSchema,
  tags: z.array(text).default([]),
  email: text.optional(),
});

const profilePageSchema = z.object({
  meta: metaSchema,
  hero: z.object({
    eyebrow: text,
    title: text,
    body: text,
    image: imageSchema,
  }),
  facts: z.array(statSchema),
  partners: z.object({
    eyebrow: text,
    title: text,
    body: text,
    items: z.array(personSchema),
  }),
  associates: z.object({
    eyebrow: text,
    title: text,
    body: text,
    items: z.array(personSchema),
  }),
  departments: z.object({
    eyebrow: text,
    title: text,
    body: text,
    items: z.array(cardSchema),
  }),
  culture: z.object({
    eyebrow: text,
    title: text,
    body: text,
    image: imageSchema,
    items: z.array(cardSchema),
  }),
  careers: z.object({
    eyebrow: text,
    title: text,
    body: text,
    email: text,
    items: z.array(
      z.object({ title: text, meta: text, label: text, href }),
    ),
  }),
  press: z.array(
    z.object({
      eyebrow: text,
      title: text,
      items: z.array(z.object({ label: text, href: href.optional() })),
      link: linkSchema.optional(),
    }),
  ),
  cta: ctaSchema,
});

const contactFormSchema = z.object({
  nameLabel: text,
  namePlaceholder: text,
  emailLabel: text,
  emailPlaceholder: text,
  phoneLabel: text,
  phonePlaceholder: text,
  companyLabel: text,
  companyPlaceholder: text,
  serviceLabel: text,
  servicePlaceholder: text,
  services: z.array(text),
  budgetLabel: text,
  budgetPlaceholder: text,
  budgets: z.array(text),
  locationLabel: text,
  locationPlaceholder: text,
  timelineLabel: text,
  timelinePlaceholder: text,
  timelines: z.array(text),
  messageLabel: text,
  messagePlaceholder: text,
  consent: text,
  submitLabel: text,
  replyNote: text,
  successMessage: text,
});

const contactPageSchema = z.object({
  meta: metaSchema,
  hero: z.object({
    eyebrow: text,
    title: text,
    body: text,
    image: imageSchema,
  }),
  methods: z.array(
    z.object({
      eyebrow: text,
      value: text,
      body: text,
      href,
      icon: text,
    }),
  ),
  enquiry: z.object({
    eyebrow: text,
    title: text,
    body: text,
    steps: z.array(z.object({ label: text, body: text })),
    emailLabel: text,
    email: text,
    cardTitle: text,
    requiredNote: text,
    form: contactFormSchema,
  }),
  offices: z.object({
    eyebrow: text,
    title: text,
    body: text,
    items: z.array(
      z.object({
        tag: text,
        city: text,
        timezone: text,
        address: z.array(text),
        phone: text,
        phoneHref: href,
        email: text,
        directions: text,
        mapLabel: text,
        mapHref: href,
        image: imageSchema,
      }),
    ),
  }),
  departments: z.object({
    eyebrow: text,
    title: text,
    body: text,
    items: z.array(z.object({ tag: text, email: text, body: text })),
  }),
  faq: z.object({
    eyebrow: text,
    title: text,
    body: text,
    noteTitle: text,
    noteBody: text,
    items: z.array(faqSchema),
  }),
  newsletter: z.object({
    eyebrow: text,
    title: text,
    body: text,
    label: text,
    placeholder: text,
    buttonLabel: text,
    successMessage: text,
    note: text,
  }),
  cta: ctaSchema,
});

export const siteContentSchema = z.object({
  site: z.object({ name: text, homeHref: href }),
  navigation: z.object({
    items: z.array(linkSchema),
    cta: linkSchema,
    mobileCtaLabel: text,
    menuLabel: text,
  }),
  footer: z.object({
    blurb: text,
    social: z.array(
      z.object({ label: text, href, icon: text }),
    ),
    columns: z.array(z.object({ title: text, links: z.array(linkSchema) })),
    studios: z.array(
      z.object({
        lines: z.array(text),
        email: text,
        phone: text,
        phoneHref: href,
      }),
    ),
    copyright: text,
    legal: z.array(linkSchema),
  }),
  pages: z.object({
    home: homePageSchema,
    about: aboutPageSchema,
    services: servicesPageSchema,
    work: workPageSchema,
    profile: profilePageSchema,
    contact: contactPageSchema,
  }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
export type HomePageContent = z.infer<typeof homePageSchema>;
export type AboutPageContent = z.infer<typeof aboutPageSchema>;
export type ServicesPageContent = z.infer<typeof servicesPageSchema>;
export type WorkPageContent = z.infer<typeof workPageSchema>;
export type ProfilePageContent = z.infer<typeof profilePageSchema>;
export type ContactPageContent = z.infer<typeof contactPageSchema>;
export type ImageContent = z.infer<typeof imageSchema>;
export type LinkContent = z.infer<typeof linkSchema>;
export type ProjectContent = z.infer<typeof projectSchema>;
export type CtaContent = z.infer<typeof ctaSchema>;
export type CardContent = z.infer<typeof cardSchema>;
export type StatContent = z.infer<typeof statSchema>;
export type FaqContent = z.infer<typeof faqSchema>;
export type PersonContent = z.infer<typeof personSchema>;
