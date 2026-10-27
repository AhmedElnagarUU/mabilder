import { z } from "zod";
import { imageSchema, linkSchema, nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const heroSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText,
  image: imageSchema.optional(),
  primary: linkSchema.optional(),
});

export type HeroProps = z.infer<typeof heroSchema>;

export const heroBlock = {
  type: "hero" as const,
  kind: "copy",
  variants: ["full-image", "page", "text-only"] as const,
  schema: heroSchema,
  needs: () => true,
  fixtures: {
    full: {
      eyebrow: "Studio — The practice",
      title: "A practice built on *patience.*",
      body: "We are architects, engineers and interior designers who believe the best buildings are not rushed into existence. They are listened for, tested, and slowly made inevitable.",
      image: {
        src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80",
        alt: "Agenvo studio interior",
        credit: { name: "Unsplash", url: "https://unsplash.com" },
      },
      primary: { label: "Meet the studio", href: "about.html" },
    },
    minimal: {
      title: "A practice built on patience.",
      body: "We are architects, engineers and interior designers working from Zurich and Dubai.",
    },
  },
} satisfies BlockDefinition<HeroProps>;
