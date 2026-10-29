import {
  getBlockDefinition,
  type BlockType,
} from "../../static-site-generator/blocks/catalog";
import type { Facts } from "../../static-site-generator/blocks/facts";
import type { HeroProps } from "../../static-site-generator/blocks/hero";
import type { IntroProps } from "../../static-site-generator/blocks/intro";
import type { Locale } from "../../static-site-generator/locale";
import {
  siteContentSchema,
  type PageSlug,
  type SiteContent,
} from "../../static-site-generator/site-content";
import { buildFactProps } from "./fact-props";
import { siteLabels } from "./labels";
import { maxFeatureSplits, pageRecipes, type PageRecipe } from "./recipes";

export type ComposeInput = {
  theme: string;
  locales: Locale[];
  defaultLocale: Locale;
  facts: Facts;
  currentYear: number;
};

type Localized<Value> = Partial<Record<Locale, Value>>;

type BlockSlot = {
  type: BlockType;
  variant: string;
};

type DraftBlock = BlockSlot & {
  id: string;
  hidden: boolean;
  props: Localized<unknown>;
};

function requireDefinition(type: BlockType) {
  const definition = getBlockDefinition(type);

  if (!definition) {
    throw new Error(`Unknown block type "${type}".`);
  }

  return definition;
}

function localize<Value>(
  locales: Locale[],
  build: (locale: Locale) => Value,
): Localized<Value> {
  return Object.fromEntries(locales.map((locale) => [locale, build(locale)]));
}

function listBlockSlots(
  recipe: PageRecipe,
  facts: Facts,
  keptSlugs: PageSlug[],
): BlockSlot[] {
  return recipe.blocks.flatMap((block) => {
    const variants = requireDefinition(block.type).variants;

    if (block.onlyWithoutContactPage && keptSlugs.includes("contact")) {
      return [];
    }

    if (block.perService) {
      return facts.services
        .slice(0, maxFeatureSplits)
        .map((_service, index) => ({ type: block.type, variant: variants[index % 2] }));
    }

    return [{ type: block.type, variant: block.variant ?? variants[0] }];
  });
}

function buildProps(
  slot: BlockSlot,
  input: ComposeInput,
  pageSlug: PageSlug,
  keptSlugs: PageSlug[],
): Localized<unknown> | undefined {
  const definition = requireDefinition(slot.type);

  if (definition.kind === "copy") {
    return localize(input.locales, () => structuredClone(definition.fixtures.minimal));
  }

  if (!definition.needs(input.facts)) {
    return undefined;
  }

  const props = localize(input.locales, (locale) =>
    buildFactProps(slot.type, {
      facts: input.facts,
      locale,
      labels: siteLabels[locale],
      currentYear: input.currentYear,
      pageSlug,
      keptSlugs,
    }),
  );

  return props[input.defaultLocale] === undefined ? undefined : props;
}

function pickVariant(slot: BlockSlot, props: unknown): string {
  if (slot.type === "hero" && (props as HeroProps).image === undefined) {
    return "text-only";
  }

  if (slot.type === "intro" && (props as IntroProps).images.length === 0) {
    return "quote";
  }

  return slot.variant;
}

function composeBlocks(
  recipe: PageRecipe,
  input: ComposeInput,
  keptSlugs: PageSlug[],
): DraftBlock[] {
  const counts = new Map<BlockType, number>();

  return listBlockSlots(recipe, input.facts, keptSlugs).flatMap((slot) => {
    const props = buildProps(slot, input, recipe.slug, keptSlugs);

    if (props === undefined) {
      return [];
    }

    const count = (counts.get(slot.type) ?? 0) + 1;
    counts.set(slot.type, count);

    return [
      {
        id: `${recipe.slug}-${slot.type}-${count}`,
        type: slot.type,
        variant: pickVariant(slot, props[input.defaultLocale]),
        hidden: false,
        props,
      },
    ];
  });
}

function isPageKept(recipe: PageRecipe, blocks: DraftBlock[]): boolean {
  if (recipe.slug === "index") {
    return true;
  }

  const afterHero = blocks.filter((block) => block.type !== "hero");
  const hasFactBlock = afterHero.some(
    (block) => requireDefinition(block.type).kind === "fact",
  );

  return afterHero.length >= 2 && (!recipe.needsFacts || hasFactBlock);
}

function selectKeptSlugs(input: ComposeInput): PageSlug[] {
  const allSlugs = pageRecipes.map((recipe) => recipe.slug);

  return pageRecipes
    .filter((recipe) => isPageKept(recipe, composeBlocks(recipe, input, allSlugs)))
    .map((recipe) => recipe.slug);
}

function buildPageMeta(slug: PageSlug, input: ComposeInput) {
  const { businessName, industry } = input.facts;

  return localize(input.locales, (locale) => ({
    title:
      slug === "index"
        ? businessName
        : `${siteLabels[locale].pages[slug]} | ${businessName}`,
    description: industry,
  }));
}

function buildNav(keptSlugs: PageSlug[], input: ComposeInput) {
  const ctaHref = keptSlugs.includes("contact") ? "contact.html" : "#contact";

  return localize(input.locales, (locale) => {
    const labels = siteLabels[locale];

    return {
      items: keptSlugs.map((slug) => ({ label: labels.pages[slug], href: `${slug}.html` })),
      cta: { label: labels.navCta, href: ctaHref },
      menuLabel: labels.menu,
      languageLabel: labels.language,
    };
  });
}

function buildFooter(input: ComposeInput) {
  const { businessName, industry } = input.facts;

  return localize(input.locales, (locale) => ({
    blurb: industry,
    copyright: `© ${input.currentYear} ${businessName}. ${siteLabels[locale].rights}`,
    photoCreditLabel: siteLabels[locale].photoCredits,
  }));
}

export function composeSite(input: ComposeInput): SiteContent {
  const keptSlugs = selectKeptSlugs(input);
  const pages = pageRecipes
    .filter((recipe) => keptSlugs.includes(recipe.slug))
    .map((recipe) => ({
      id: recipe.slug,
      slug: recipe.slug,
      meta: buildPageMeta(recipe.slug, input),
      blocks: composeBlocks(recipe, input, keptSlugs),
    }));

  return siteContentSchema.parse({
    theme: input.theme,
    locales: input.locales,
    defaultLocale: input.defaultLocale,
    facts: input.facts,
    nav: buildNav(keptSlugs, input),
    footer: buildFooter(input),
    pages,
  });
}
