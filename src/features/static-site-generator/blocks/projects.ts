import { z } from "zod";
import { imageSchema, linkSchema, nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

const projectItemSchema = z.object({
  title: nonEmptyText,
  meta: nonEmptyText,
  category: nonEmptyText.optional(),
  status: nonEmptyText.optional(),
  body: nonEmptyText.optional(),
  href: linkSchema.shape.href.optional(),
  image: imageSchema,
});

export const projectsSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText.optional(),
  items: z.array(projectItemSchema),
  link: linkSchema.optional(),
});

export type ProjectsProps = z.infer<typeof projectsSchema>;

export const projectsBlock = {
  type: "projects" as const,
  kind: "fact",
  variants: ["featured", "grid"] as const,
  schema: projectsSchema,
  needs: (facts) => facts.projects.length >= 1,
  fixtures: {
    full: {
      eyebrow: "Archive",
      title: "Selected projects",
      body: "Twenty-two projects, seven countries, eighteen years. A selection of the work we are proudest of — and the thinking behind it.",
      items: [
        {
          title: "Water Pavilion",
          meta: "Lake Como, Italy — 2023",
          category: "Cultural",
          body: "A cantilevered stone roof, a reflecting pool, and a building that almost disappears into the lake.",
          image: {
            src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
            alt: "Water Pavilion",
            credit: { name: "Unsplash", url: "https://unsplash.com" },
          },
        },
        {
          title: "Forest Retreat",
          meta: "Swiss Alps — 2023",
          category: "Residential",
          body: "Three timber volumes stepped into a slope, each opening to a different horizon. Heated entirely by ground source.",
          image: {
            src: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
            alt: "Forest Retreat",
            credit: { name: "Unsplash", url: "https://unsplash.com" },
          },
        },
        {
          title: "Skyline Residence",
          meta: "Singapore — 2022",
          category: "Residential",
          body: "A tropical villa organised around a shaded courtyard, with deep eaves and cross-ventilation instead of air conditioning.",
          image: {
            src: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800&q=80",
            alt: "Skyline Residence",
            credit: { name: "Unsplash", url: "https://unsplash.com" },
          },
        },
      ],
      link: { label: "View all", href: "projects.html" },
    },
    minimal: {
      title: "Selected projects",
      items: [
        {
          title: "Water Pavilion",
          meta: "Lake Como, Italy — 2023",
          image: {
            src: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
            alt: "Water Pavilion",
          },
        },
      ],
    },
  },
} satisfies BlockDefinition<ProjectsProps>;
