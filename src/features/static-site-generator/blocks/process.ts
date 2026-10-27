import { z } from "zod";
import { cardSchema, nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const processSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText.optional(),
  steps: z.array(cardSchema).min(3).max(6),
});

export type ProcessProps = z.infer<typeof processSchema>;

export const processBlock = {
  type: "process" as const,
  kind: "copy",
  variants: ["default"] as const,
  schema: processSchema,
  needs: () => true,
  fixtures: {
    full: {
      eyebrow: "How We Work",
      title: "A disciplined creative process",
      body: "Most commissions follow the same rhythm. The pace changes with scale, but the sequence of decisions does not.",
      steps: [
        {
          title: "Discovery",
          body: "Site analysis, client vision workshops, and feasibility studies.",
        },
        {
          title: "Concept",
          body: "Schematic design, 3D massing, and material palette exploration.",
        },
        {
          title: "Development",
          body: "Detailed drawings, BIM coordination, and engineering integration.",
        },
        {
          title: "Delivery",
          body: "Construction administration and final styling oversight.",
        },
      ],
    },
    minimal: {
      title: "A disciplined creative process",
      steps: [
        {
          title: "Discovery",
          body: "Site analysis, client vision workshops, and feasibility studies.",
        },
        {
          title: "Concept",
          body: "Schematic design, 3D massing, and material palette exploration.",
        },
        {
          title: "Development",
          body: "Detailed drawings, BIM coordination, and engineering integration.",
        },
      ],
    },
  },
} satisfies BlockDefinition<ProcessProps>;
