import { z } from "zod";
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

const heroBlockSchema = blockBaseSchema.extend({
  type: z.literal("hero"),
  variant: z.enum(heroBlock.variants),
  props: localized(heroBlock.schema),
});

const marqueeBlockSchema = blockBaseSchema.extend({
  type: z.literal("marquee"),
  variant: z.enum(marqueeBlock.variants),
  props: localized(marqueeBlock.schema),
});

const introBlockSchema = blockBaseSchema.extend({
  type: z.literal("intro"),
  variant: z.enum(introBlock.variants),
  props: localized(introBlock.schema),
});

const featureSplitBlockSchema = blockBaseSchema.extend({
  type: z.literal("feature-split"),
  variant: z.enum(featureSplitBlock.variants),
  props: localized(featureSplitBlock.schema),
});

const servicesBlockSchema = blockBaseSchema.extend({
  type: z.literal("services"),
  variant: z.enum(servicesBlock.variants),
  props: localized(servicesBlock.schema),
});

const valuesBlockSchema = blockBaseSchema.extend({
  type: z.literal("values"),
  variant: z.enum(valuesBlock.variants),
  props: localized(valuesBlock.schema),
});

const processBlockSchema = blockBaseSchema.extend({
  type: z.literal("process"),
  variant: z.enum(processBlock.variants),
  props: localized(processBlock.schema),
});

const faqBlockSchema = blockBaseSchema.extend({
  type: z.literal("faq"),
  variant: z.enum(faqBlock.variants),
  props: localized(faqBlock.schema),
});

const ctaBlockSchema = blockBaseSchema.extend({
  type: z.literal("cta"),
  variant: z.enum(ctaBlock.variants),
  props: localized(ctaBlock.schema),
});

const contactBlockSchema = blockBaseSchema.extend({
  type: z.literal("contact"),
  variant: z.enum(contactBlock.variants),
  props: localized(contactBlock.schema),
});

const statsBlockSchema = blockBaseSchema.extend({
  type: z.literal("stats"),
  variant: z.enum(statsBlock.variants),
  props: localized(statsBlock.schema),
});

const clientsBlockSchema = blockBaseSchema.extend({
  type: z.literal("clients"),
  variant: z.enum(clientsBlock.variants),
  props: localized(clientsBlock.schema),
});

const awardsBlockSchema = blockBaseSchema.extend({
  type: z.literal("awards"),
  variant: z.enum(awardsBlock.variants),
  props: localized(awardsBlock.schema),
});

const timelineBlockSchema = blockBaseSchema.extend({
  type: z.literal("timeline"),
  variant: z.enum(timelineBlock.variants),
  props: localized(timelineBlock.schema),
});

const projectsBlockSchema = blockBaseSchema.extend({
  type: z.literal("projects"),
  variant: z.enum(projectsBlock.variants),
  props: localized(projectsBlock.schema),
});

const teamBlockSchema = blockBaseSchema.extend({
  type: z.literal("team"),
  variant: z.enum(teamBlock.variants),
  props: localized(teamBlock.schema),
});

const testimonialsBlockSchema = blockBaseSchema.extend({
  type: z.literal("testimonials"),
  variant: z.enum(testimonialsBlock.variants),
  props: localized(testimonialsBlock.schema),
});

const locationBlockSchema = blockBaseSchema.extend({
  type: z.literal("location"),
  variant: z.enum(locationBlock.variants),
  props: localized(locationBlock.schema),
});

export const blockSchema = z.discriminatedUnion("type", [
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

export type Block = z.infer<typeof blockSchema>;
