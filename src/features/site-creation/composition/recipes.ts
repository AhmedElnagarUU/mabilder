import type { BlockType } from "../../static-site-generator/blocks/catalog";
import type { PageSlug } from "../../static-site-generator/site-content";

export type RecipeBlock = {
  type: BlockType;
  variant?: string;
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

export const pageRecipes: PageRecipe[] = [
  {
    slug: "index",
    needsFacts: false,
    blocks: [
      { type: "hero", variant: "full-image" },
      { type: "marquee" },
      { type: "stats" },
      { type: "intro" },
      { type: "projects", variant: "featured" },
      { type: "services", variant: "columns" },
      { type: "process" },
      { type: "testimonials" },
      { type: "clients" },
      { type: "cta" },
      { type: "contact", variant: "split", onlyWithoutContactPage: true },
    ],
  },
  {
    slug: "about",
    needsFacts: true,
    blocks: [
      { type: "hero", variant: "page" },
      { type: "intro", variant: "quote" },
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
      { type: "hero", variant: "page" },
      { type: "services", variant: "list" },
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
      { type: "hero", variant: "page" },
      { type: "projects", variant: "grid" },
      { type: "stats" },
      { type: "clients" },
      { type: "cta" },
    ],
  },
  {
    slug: "contact",
    needsFacts: false,
    blocks: [
      { type: "hero", variant: "page" },
      { type: "contact", variant: "form-only" },
      { type: "location" },
      { type: "faq" },
    ],
  },
];
