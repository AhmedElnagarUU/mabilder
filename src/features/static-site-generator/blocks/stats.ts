import { z } from "zod";
import { nonEmptyText, statSchema } from "./common";
import type { BlockDefinition } from "./types";

export const statsSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  items: z.array(statSchema).min(2).max(4),
});

export type StatsProps = z.infer<typeof statsSchema>;

export const statsBlock = {
  type: "stats" as const,
  kind: "fact",
  variants: ["dark", "light"] as const,
  schema: statsSchema,
  needs: (facts) => {
    const sources = [
      facts.yearsInBusiness !== undefined,
      facts.projectCount !== undefined,
      facts.clients.length >= 3,
      facts.awards.length >= 1,
    ];
    return sources.filter(Boolean).length >= 2;
  },
  fixtures: {
    full: {
      eyebrow: "By the numbers",
      title: "What eighteen years adds up to.",
      items: [
        { value: "180", label: "Projects completed" },
        { value: "16", label: "Countries" },
        { value: "42", label: "Awards" },
        { value: "96%", label: "Clients who return" },
      ],
    },
    minimal: {
      title: "What eighteen years adds up to.",
      items: [
        { value: "180", label: "Projects completed" },
        { value: "16", label: "Countries" },
      ],
    },
  },
} satisfies BlockDefinition<StatsProps>;
