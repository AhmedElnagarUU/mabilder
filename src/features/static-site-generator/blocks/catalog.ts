import { z } from "zod";
import { getDesignsForCategory, legacyDesignId } from "../designs/registry";
import { localized } from "../locale";
import { awardsBlock } from "./awards";
import { clientsBlock } from "./clients";
import { nonEmptyText } from "./common";
import { contactBlock } from "./contact";
import { ctaBlock } from "./cta";
import { faqBlock } from "./faq";
import { featureSplitBlock } from "./feature-split";
import { heroBlock } from "./hero";
import { introBlock } from "./intro";
import { locationBlock } from "./location";
import { marqueeBlock } from "./marquee";
import { processBlock } from "./process";
import { projectsBlock } from "./projects";
import { servicesBlock } from "./services";
import { statsBlock } from "./stats";
import { teamBlock } from "./team";
import { testimonialsBlock } from "./testimonials";
import { timelineBlock } from "./timeline";
import { valuesBlock } from "./values";

export const blockDefinitions = [
  heroBlock,
  marqueeBlock,
  introBlock,
  featureSplitBlock,
  servicesBlock,
  valuesBlock,
  processBlock,
  faqBlock,
  ctaBlock,
  contactBlock,
  statsBlock,
  clientsBlock,
  awardsBlock,
  timelineBlock,
  projectsBlock,
  teamBlock,
  testimonialsBlock,
  locationBlock,
] as const;

export type BlockType = (typeof blockDefinitions)[number]["type"];

export function getBlockDefinition(
  type: BlockType,
): (typeof blockDefinitions)[number] | undefined {
  return blockDefinitions.find((definition) => definition.type === type);
}

const blockBaseSchema = z.object({
  id: nonEmptyText,
  hidden: z.boolean(),
});

function designSchema(category: BlockType) {
  const ids = getDesignsForCategory(category).map((design) => design.id);

  if (ids.length === 0) {
    throw new Error(`No design registered for block category "${category}".`);
  }

  return z.enum(ids as [string, ...string[]]);
}

const heroBlockSchema = blockBaseSchema.extend({
  type: z.literal("hero"),
  design: designSchema("hero"),
  props: localized(heroBlock.schema),
});

const marqueeBlockSchema = blockBaseSchema.extend({
  type: z.literal("marquee"),
  design: designSchema("marquee"),
  props: localized(marqueeBlock.schema),
});

const introBlockSchema = blockBaseSchema.extend({
  type: z.literal("intro"),
  design: designSchema("intro"),
  props: localized(introBlock.schema),
});

const featureSplitBlockSchema = blockBaseSchema.extend({
  type: z.literal("feature-split"),
  design: designSchema("feature-split"),
  props: localized(featureSplitBlock.schema),
});

const servicesBlockSchema = blockBaseSchema.extend({
  type: z.literal("services"),
  design: designSchema("services"),
  props: localized(servicesBlock.schema),
});

const valuesBlockSchema = blockBaseSchema.extend({
  type: z.literal("values"),
  design: designSchema("values"),
  props: localized(valuesBlock.schema),
});

const processBlockSchema = blockBaseSchema.extend({
  type: z.literal("process"),
  design: designSchema("process"),
  props: localized(processBlock.schema),
});

const faqBlockSchema = blockBaseSchema.extend({
  type: z.literal("faq"),
  design: designSchema("faq"),
  props: localized(faqBlock.schema),
});

const ctaBlockSchema = blockBaseSchema.extend({
  type: z.literal("cta"),
  design: designSchema("cta"),
  props: localized(ctaBlock.schema),
});

const contactBlockSchema = blockBaseSchema.extend({
  type: z.literal("contact"),
  design: designSchema("contact"),
  props: localized(contactBlock.schema),
});

const statsBlockSchema = blockBaseSchema.extend({
  type: z.literal("stats"),
  design: designSchema("stats"),
  props: localized(statsBlock.schema),
});

const clientsBlockSchema = blockBaseSchema.extend({
  type: z.literal("clients"),
  design: designSchema("clients"),
  props: localized(clientsBlock.schema),
});

const awardsBlockSchema = blockBaseSchema.extend({
  type: z.literal("awards"),
  design: designSchema("awards"),
  props: localized(awardsBlock.schema),
});

const timelineBlockSchema = blockBaseSchema.extend({
  type: z.literal("timeline"),
  design: designSchema("timeline"),
  props: localized(timelineBlock.schema),
});

const projectsBlockSchema = blockBaseSchema.extend({
  type: z.literal("projects"),
  design: designSchema("projects"),
  props: localized(projectsBlock.schema),
});

const teamBlockSchema = blockBaseSchema.extend({
  type: z.literal("team"),
  design: designSchema("team"),
  props: localized(teamBlock.schema),
});

const testimonialsBlockSchema = blockBaseSchema.extend({
  type: z.literal("testimonials"),
  design: designSchema("testimonials"),
  props: localized(testimonialsBlock.schema),
});

const locationBlockSchema = blockBaseSchema.extend({
  type: z.literal("location"),
  design: designSchema("location"),
  props: localized(locationBlock.schema),
});

const blockUnionSchema = z.discriminatedUnion("type", [
  heroBlockSchema,
  marqueeBlockSchema,
  introBlockSchema,
  featureSplitBlockSchema,
  servicesBlockSchema,
  valuesBlockSchema,
  processBlockSchema,
  faqBlockSchema,
  ctaBlockSchema,
  contactBlockSchema,
  statsBlockSchema,
  clientsBlockSchema,
  awardsBlockSchema,
  timelineBlockSchema,
  projectsBlockSchema,
  teamBlockSchema,
  testimonialsBlockSchema,
  locationBlockSchema,
]);

function migrateVariant(block: unknown): unknown {
  if (typeof block !== "object" || block === null) {
    return block;
  }

  const record = block as Record<string, unknown>;

  if (
    typeof record.design === "string" ||
    typeof record.type !== "string" ||
    typeof record.variant !== "string"
  ) {
    return block;
  }

  return { ...record, design: legacyDesignId(record.type, record.variant) };
}

export const blockSchema = z.preprocess(migrateVariant, blockUnionSchema);

export type Block = z.infer<typeof blockSchema>;
