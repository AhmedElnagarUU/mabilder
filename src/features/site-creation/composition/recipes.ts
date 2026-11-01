import type { BlockType } from "../../static-site-generator/blocks/catalog";
import type { PageSlug } from "../../static-site-generator/site-content";

export type RecipeBlock = {
  type: BlockType;
  design?: string;
  perService?: true;
  onlyWithoutContactPage?: true;
};

export type PageRecipe = {
  slug: PageSlug;
  needsFacts: boolean;
  blocks: RecipeBlock[];
};

export const maxFeatureSplits = 3;
export const maxHomeProjects = 6;
export const maxHomeReviews = 6;
export const minReviewsForAverage = 3;

export const pageRecipes: PageRecipe[] = [
  {
    slug: "index",
    needsFacts: false,
    blocks: [
      { type: "hero", design: "agenvo/hero-full-image" },
      { type: "marquee" },
      { type: "stats" },
      { type: "intro" },
      { type: "projects", design: "agenvo/projects-featured" },
      { type: "services", design: "agenvo/services-columns" },
      { type: "process" },
      { type: "testimonials" },
      { type: "clients" },
      { type: "cta" },
      { type: "contact", design: "agenvo/contact-split", onlyWithoutContactPage: true },
    ],
  },
  {
    slug: "about",
    needsFacts: true,
    blocks: [
      { type: "hero", design: "agenvo/hero-page" },
      { type: "intro", design: "agenvo/intro-quote" },
      { type: "values" },
      { type: "timeline" },
      { type: "team" },
      { type: "awards" },
      { type: "cta" },
    ],
  },
  {
    slug: "services",
    needsFacts: false,
    blocks: [
      { type: "hero", design: "agenvo/hero-page" },
      { type: "services", design: "agenvo/services-list" },
      { type: "feature-split", perService: true },
      { type: "process" },
      { type: "faq" },
      { type: "cta" },
    ],
  },
  {
    slug: "projects",
    needsFacts: true,
    blocks: [
      { type: "hero", design: "agenvo/hero-page" },
      { type: "projects", design: "agenvo/projects-grid" },
      { type: "stats" },
      { type: "clients" },
      { type: "cta" },
    ],
  },
  {
    slug: "contact",
    needsFacts: false,
    blocks: [
      { type: "hero", design: "agenvo/hero-page" },
      { type: "contact", design: "agenvo/contact-form-only" },
      { type: "location" },
      { type: "faq" },
    ],
  },
];
