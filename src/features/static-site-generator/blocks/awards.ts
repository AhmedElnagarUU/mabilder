import { z } from "zod";
import { nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const awardsSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText.optional(),
  items: z.array(
    z.object({
      year: nonEmptyText,
      title: nonEmptyText,
    }),
  ),
});

export type AwardsProps = z.infer<typeof awardsSchema>;

export const awardsBlock = {
  type: "awards" as const,
  kind: "fact",
  variants: ["default"] as const,
  schema: awardsSchema,
  needs: (facts) => facts.awards.length >= 1,
  fixtures: {
    full: {
      eyebrow: "Recognition",
      title: "Awarded for the work,\nnot the noise.",
      body: "We are grateful for the recognition, but we measure success in occupied buildings, returning clients and neighbourhoods that age well.",
      items: [
        {
          year: "2025",
          title: "RIBA International Prize — Shortlist, Corporate Tower",
        },
        {
          year: "2024",
          title: "Dezeen Awards — Commercial Building of the Year",
        },
        {
          year: "2023",
          title: "Swiss Architecture Award — Forest Retreat",
        },
        {
          year: "2022",
          title: "Architizer A+ Award — Adaptive Reuse, Kant Garagen",
        },
        {
          year: "2019",
          title: "ARIA Prize — Water Pavilion, Lake Como",
        },
      ],
    },
    minimal: {
      title: "Awarded for the work,\nnot the noise.",
      items: [
        {
          year: "2025",
          title: "RIBA International Prize — Shortlist, Corporate Tower",
        },
      ],
    },
  },
} satisfies BlockDefinition<AwardsProps>;
