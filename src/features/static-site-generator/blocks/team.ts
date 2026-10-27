import { z } from "zod";
import { imageSchema, nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const teamSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText.optional(),
  items: z.array(
    z.object({
      name: nonEmptyText,
      role: nonEmptyText,
      bio: nonEmptyText,
      image: imageSchema.optional(),
    }),
  ),
});

export type TeamProps = z.infer<typeof teamSchema>;

export const teamBlock = {
  type: "team" as const,
  kind: "fact",
  variants: ["default"] as const,
  schema: teamSchema,
  needs: (facts) => facts.team.length >= 1,
  fixtures: {
    full: {
      eyebrow: "Partners",
      title: "The ones who sign\nthe drawings.",
      body: "Agenvo is employee-owned and led by four partners. Each remains directly involved in projects — reviewing drawings, visiting sites, and sitting in the room when difficult decisions are made.",
      items: [
        {
          name: "Elena Marchetti",
          role: "Architecture & Design",
          bio: "Trained in Milan and at ETH Zurich. Elena leads the studio's cultural and residential work, and is responsible for design quality across every commission.",
          image: {
            src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=80",
            alt: "Elena Marchetti",
            credit: { name: "Unsplash", url: "https://unsplash.com" },
          },
        },
        {
          name: "Jonas Frei",
          role: "Engineering & Structure",
          bio: "A structural engineer who thinks like an architect. Jonas built the in-house engineering team and leads long-span, timber and adaptive-reuse projects.",
          image: {
            src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80",
            alt: "Jonas Frei",
            credit: { name: "Unsplash", url: "https://unsplash.com" },
          },
        },
        {
          name: "Amara Okafor",
          role: "Interiors & Furniture",
          bio: "Amara leads interior architecture, material research and the studio's furniture collaborations. Her work is guided by tactility, daylight and generosity.",
          image: {
            src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=600&q=80",
            alt: "Amara Okafor",
            credit: { name: "Unsplash", url: "https://unsplash.com" },
          },
        },
      ],
    },
    minimal: {
      title: "The ones who sign\nthe drawings.",
      items: [
        {
          name: "Elena Marchetti",
          role: "Architecture & Design",
          bio: "Trained in Milan and at ETH Zurich. Elena leads the studio's cultural and residential work.",
        },
      ],
    },
  },
} satisfies BlockDefinition<TeamProps>;
