import { z } from "zod";

export const localeSchema = z.enum(["en", "ar"]);

export type Locale = z.infer<typeof localeSchema>;

export function localized<Schema extends z.ZodType>(schema: Schema) {
  return z
    .object({
      en: schema.optional(),
      ar: schema.optional(),
    })
    .loose();
}
