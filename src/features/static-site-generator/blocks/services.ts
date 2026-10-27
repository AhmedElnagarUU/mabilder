import { z } from "zod";
import { cardSchema, nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const servicesSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText.optional(),
  items: z.array(cardSchema).min(2).max(6),
});

export type ServicesProps = z.infer<typeof servicesSchema>;

export const servicesBlock = {
  type: "services" as const,
  kind: "copy",
  variants: ["columns", "list"] as const,
  schema: servicesSchema,
  needs: () => true,
  fixtures: {
    full: {
      eyebrow: "What we do",
      title: "Three disciplines, one studio.",
      body: "Architecture, engineering and interiors under one roof — so the idea survives contact with reality.",
      items: [
        {
          title: "Architecture",
          body: "Residential, commercial, and mixed-use projects from concept to completion documents.",
          icon: "building-2",
        },
        {
          title: "Engineering",
          body: "Structural, MEP, and sustainability consulting integrated into every design decision.",
          icon: "ruler",
        },
        {
          title: "Interiors",
          body: "Bespoke interior architecture with custom furniture and lighting design.",
          icon: "sofa",
        },
      ],
    },
    minimal: {
      title: "Three disciplines, one studio.",
      items: [
        {
          title: "Architecture",
          body: "Residential, commercial, and mixed-use projects from concept to completion documents.",
        },
        {
          title: "Engineering",
          body: "Structural, MEP, and sustainability consulting integrated into every design decision.",
        },
      ],
    },
  },
} satisfies BlockDefinition<ServicesProps>;
