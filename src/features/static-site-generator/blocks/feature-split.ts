import { z } from "zod";
import { imageSchema, linkSchema, nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const featureSplitSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  paragraphs: z.array(nonEmptyText),
  points: z.array(nonEmptyText),
  image: imageSchema.optional(),
  link: linkSchema.optional(),
});

export type FeatureSplitProps = z.infer<typeof featureSplitSchema>;

export const featureSplitBlock = {
  type: "feature-split" as const,
  kind: "copy",
  variants: ["image-right", "image-left"] as const,
  schema: featureSplitSchema,
  needs: () => true,
  fixtures: {
    full: {
      eyebrow: "02 — Engineering",
      title: "Structure as an idea, not an obstacle.",
      paragraphs: [
        "Our in-house structural and MEP engineers are part of the design conversation from the first meeting. That means fewer surprises, faster decisions, and structures that make the architecture possible rather than merely holding it up.",
        "We specialise in long-span concrete, hybrid timber, and the careful intervention of existing structures. Every scheme is modelled, load-tested in principle, and costed before it leaves the studio.",
      ],
      points: [
        "Structural concept and detailed design",
        "MEP coordination and building services",
        "Facade engineering and thermal modelling",
        "Existing-structure surveys and strengthening",
        "Construction methodology and site supervision",
      ],
      image: {
        src: "https://images.unsplash.com/photo-1503387837-b154d5074bd2?w=1000&q=80",
        alt: "Structural frame under construction",
        credit: { name: "Unsplash", url: "https://unsplash.com" },
      },
      link: { label: "See the engineering work", href: "projects.html" },
    },
    minimal: {
      title: "Structure as an idea, not an obstacle.",
      paragraphs: [
        "Our in-house structural and MEP engineers are part of the design conversation from the first meeting.",
      ],
      points: ["Structural concept and detailed design"],
    },
  },
} satisfies BlockDefinition<FeatureSplitProps>;
