import { z } from "zod";
import { nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const marqueeSchema = z.object({
  items: z.array(nonEmptyText).min(3).max(8),
});

export type MarqueeProps = z.infer<typeof marqueeSchema>;

export const marqueeBlock = {
  type: "marquee" as const,
  kind: "copy",
  variants: ["default"] as const,
  schema: marqueeSchema,
  needs: () => true,
  fixtures: {
    full: {
      items: [
        "Corporate Tower — 2024",
        "Water Pavilion — 2023",
        "Forest Retreat — 2023",
        "Skyline Residence — 2022",
        "Marina Complex — 2022",
      ],
    },
    minimal: {
      items: ["Corporate Tower — 2024", "Water Pavilion — 2023", "Forest Retreat — 2023"],
    },
  },
} satisfies BlockDefinition<MarqueeProps>;
