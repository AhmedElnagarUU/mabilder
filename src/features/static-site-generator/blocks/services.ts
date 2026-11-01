import { z } from "zod";
import { cardSchema, imageSchema, nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

const serviceItemSchema = cardSchema.extend({
  image: imageSchema.optional(),
});

export const servicesSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText.optional(),
  items: z.array(serviceItemSchema).min(2).max(6),
});

export type ServicesProps = z.infer<typeof servicesSchema>;

export const servicesBlock = {
  type: "services" as const,
  kind: "copy",
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
          image: {
            src: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
            alt: "Architecture",
            credit: { name: "Unsplash", url: "https://unsplash.com" },
          },
        },
        {
          title: "Engineering",
          body: "Structural, MEP, and sustainability consulting integrated into every design decision.",
          icon: "ruler",
          image: {
            src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80",
            alt: "Engineering",
            credit: { name: "Unsplash", url: "https://unsplash.com" },
          },
        },
        {
          title: "Interiors",
          body: "Bespoke interior architecture with custom furniture and lighting design.",
          icon: "sofa",
          image: {
            src: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
            alt: "Interiors",
          },
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
