import { z } from "zod";
import { isSafeImageUrl } from "../static-site-generator/content/html";

export const MAX_PROJECT_PHOTOS = 10;

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(2000).optional(),
);

const localizedTextSchema = z.object({
  en: optionalText,
  ar: optionalText,
});

// A photo is only a public image URL, so an uploaded photo (U1) has the same shape.
export const projectPhotoSchema = z.object({
  url: z.string().trim().max(2000).refine(isSafeImageUrl, "Use an http(s) image URL."),
  alt: optionalText,
});

export const projectInputSchema = z.object({
  title: localizedTextSchema,
  category: localizedTextSchema.optional(),
  location: localizedTextSchema.optional(),
  year: optionalText,
  description: localizedTextSchema.optional(),
  photos: z.array(projectPhotoSchema).max(MAX_PROJECT_PHOTOS),
  showOnHome: z.boolean(),
});

export const projectOrderSchema = z.object({
  ids: z.array(z.string().min(1)),
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type ProjectPhoto = z.infer<typeof projectPhotoSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;

export type Project = ProjectInput & {
  id: string;
  order: number;
};

export type ProjectsSite = {
  siteId: string;
  locales: ("en" | "ar")[];
  defaultLocale: "en" | "ar";
};
