import { z } from "zod";
import { localized, type Locale } from "../static-site-generator/locale";

export const seoTextSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(320),
});

export const seoInputSchema = z.object({
  pages: z
    .array(
      z.object({
        id: z.string().min(1),
        meta: localized(seoTextSchema),
      }),
    )
    .min(1),
});

export type SeoText = z.infer<typeof seoTextSchema>;
export type SeoInput = z.infer<typeof seoInputSchema>;
export type SeoPageMeta = Partial<Record<Locale, SeoText>>;
