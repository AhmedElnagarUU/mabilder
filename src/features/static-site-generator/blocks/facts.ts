import { z } from "zod";
import { localeSchema } from "../locale";
import { imageSchema, nonEmptyText } from "./common";

export const factsSchema = z.object({
  businessName: nonEmptyText,
  industry: nonEmptyText,
  email: nonEmptyText.optional(),
  phone: nonEmptyText.optional(),
  website: nonEmptyText.optional(),
  address: nonEmptyText.optional(),
  yearsInBusiness: z.number().int().positive().optional(),
  projectCount: z.number().int().positive().optional(),
  services: z.array(nonEmptyText),
  clients: z.array(nonEmptyText),
  awards: z.array(
    z.object({
      year: nonEmptyText,
      title: nonEmptyText,
    }),
  ),
  projects: z.array(
    z.object({
      title: nonEmptyText,
      category: nonEmptyText.optional(),
      location: nonEmptyText.optional(),
      year: nonEmptyText.optional(),
      description: nonEmptyText.optional(),
      images: z.array(imageSchema),
      showOnHome: z.boolean().optional(),
      translations: z
        .partialRecord(
          localeSchema,
          z.object({
            title: nonEmptyText.optional(),
            category: nonEmptyText.optional(),
            location: nonEmptyText.optional(),
            description: nonEmptyText.optional(),
          }),
        )
        .optional(),
    }),
  ),
  team: z.array(
    z.object({
      name: nonEmptyText,
      role: nonEmptyText,
      bio: nonEmptyText.optional(),
      image: imageSchema.optional(),
    }),
  ),
  testimonials: z.array(
    z.object({
      quote: nonEmptyText,
      author: nonEmptyText,
      company: nonEmptyText.optional(),
    }),
  ),
});

export type Facts = z.infer<typeof factsSchema>;
