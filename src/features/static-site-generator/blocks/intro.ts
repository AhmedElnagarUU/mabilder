import { z } from "zod";
import { imageSchema, linkSchema, nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const introSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  paragraphs: z.array(nonEmptyText),
  quote: nonEmptyText.optional(),
  images: z.array(imageSchema).max(3),
  link: linkSchema.optional(),
});

export type IntroProps = z.infer<typeof introSchema>;

export const introBlock = {
  type: "intro" as const,
  kind: "copy",
  variants: ["images", "quote"] as const,
  schema: introSchema,
  needs: () => true,
  fixtures: {
    full: {
      eyebrow: "The Studio",
      title: "Where precision meets poetry.",
      paragraphs: [
        "Agenvo is a collective of architects, structural engineers, and interior designers united by a single belief: great spaces should feel inevitable. We work at the intersection of art and engineering.",
        "From concept sketches to construction oversight, we guide every phase with obsessive attention to material, light, and proportion.",
      ],
      quote:
        "Agenvo was founded on a simple conviction: that architecture should serve the life inside it long after the photographs have faded.",
      images: [
        {
          src: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=500&q=80",
          alt: "Studio",
          credit: { name: "Unsplash", url: "https://unsplash.com" },
        },
        {
          src: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=500&q=80",
          alt: "Model",
          credit: { name: "Unsplash", url: "https://unsplash.com" },
        },
        {
          src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=500&q=80",
          alt: "Building",
          credit: { name: "Unsplash", url: "https://unsplash.com" },
        },
      ],
      link: { label: "Meet the studio", href: "about.html" },
    },
    minimal: {
      title: "Where precision meets poetry.",
      paragraphs: [
        "Agenvo is a collective of architects, structural engineers, and interior designers working from Zurich and Dubai.",
      ],
      images: [],
    },
  },
} satisfies BlockDefinition<IntroProps>;
