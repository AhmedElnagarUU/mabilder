import { z } from "zod";
import { nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const testimonialsSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  items: z.array(
    z.object({
      quote: nonEmptyText,
      author: nonEmptyText,
      company: nonEmptyText.optional(),
      rating: z.number().int().min(1).max(5).optional(),
    }),
  ),
  averageRating: z.number().min(1).max(5).optional(),
  reviewCount: z.number().int().positive().optional(),
});

export type TestimonialsProps = z.infer<typeof testimonialsSchema>;

export const testimonialsBlock = {
  type: "testimonials" as const,
  kind: "fact",
  schema: testimonialsSchema,
  needs: (facts) => facts.testimonials.length >= 1 || (facts.reviews ?? []).length >= 1,
  fixtures: {
    full: {
      eyebrow: "Client voices",
      title: "Trusted with the brief.",
      items: [
        {
          quote:
            "Agenvo showed us that the most sustainable building on the site was the one we were about to knock down. That argument changed the entire project.",
          author: "Martin Keller",
          company: "Kant Immobilien",
        },
      ],
    },
    minimal: {
      title: "Trusted with the brief.",
      items: [
        {
          quote:
            "Agenvo showed us that the most sustainable building on the site was the one we were about to knock down.",
          author: "Martin Keller",
        },
      ],
    },
  },
} satisfies BlockDefinition<TestimonialsProps>;
