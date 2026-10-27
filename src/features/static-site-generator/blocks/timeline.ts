import { z } from "zod";
import { nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const timelineSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText.optional(),
  items: z.array(
    z.object({
      year: nonEmptyText,
      title: nonEmptyText,
      body: nonEmptyText,
    }),
  ),
});

export type TimelineProps = z.infer<typeof timelineSchema>;

export const timelineBlock = {
  type: "timeline" as const,
  kind: "fact",
  variants: ["default"] as const,
  schema: timelineSchema,
  needs: (facts) =>
    facts.yearsInBusiness !== undefined && facts.yearsInBusiness >= 2,
  fixtures: {
    full: {
      eyebrow: "Our history",
      title: "Eighteen years,\none conversation.",
      body: "A studio evolves the way a building does — slowly, in layers, with each decision making the next one clearer. These are the moments that shaped how we work.",
      items: [
        {
          year: "2008",
          title: "Two architects, one table",
          body: "Elena Marchetti and Jonas Frei establish Agenvo in a former print workshop in Zurich's Kreis 5. The first commission is a private house in Küsnacht.",
        },
        {
          year: "2011",
          title: "First international project",
          body: "A lakeside pavilion on Lake Como brings the studio into Italy. The project establishes our long-running collaboration with local stonemasons and timber fabricators.",
        },
        {
          year: "2014",
          title: "Engineering brought in-house",
          body: "Rather than outsourcing structure, we build a dedicated engineering team. The move halves coordination time on complex projects.",
        },
        {
          year: "2016",
          title: "Dubai studio opens",
          body: "A second studio opens in Dubai's Design District to serve clients across the Gulf, with a focus on commercial towers, hospitality and large-scale masterplanning.",
        },
        {
          year: "2019",
          title: "Water Pavilion wins the ARIA Prize",
          body: "The pavilion is recognised for its cantilevered stone roof and zero-discharge water system. It remains our most-visited built work.",
        },
        {
          year: "2022",
          title: "Carbon-neutral operations",
          body: "Both studios transition to verified carbon-neutral operations. We publish our first project carbon assessments.",
        },
        {
          year: "2024",
          title: "Corporate Tower completes",
          body: "Our largest project to date opens in Dubai: 48 storeys, a publicly accessible sky lobby, and a facade that cuts solar gain by 38% against the local baseline.",
        },
        {
          year: "2026",
          title: "Sixty-four people, sixteen countries",
          body: "The studio is now employee-owned, with a mandate to remain independent. Current research explores low-carbon concrete, prefabricated stone and adaptive reuse.",
        },
      ],
    },
    minimal: {
      title: "Eighteen years,\none conversation.",
      items: [
        {
          year: "2008",
          title: "Two architects, one table",
          body: "Elena Marchetti and Jonas Frei establish Agenvo in a former print workshop in Zurich's Kreis 5.",
        },
      ],
    },
  },
} satisfies BlockDefinition<TimelineProps>;
