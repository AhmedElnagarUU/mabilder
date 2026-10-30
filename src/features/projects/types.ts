import { z } from "zod";
import { isSafeImageUrl } from "../static-site-generator/content/html";

export const MAX_PROJECT_PHOTOS = 15;

export const projectCategories = [
  "residential",
  "commercial",
  "hospitality",
  "retail",
  "office",
  "villa",
  "other",
] as const;

export const projectStatuses = ["completed", "in-progress", "upcoming"] as const;

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
  z.string().trim().max(2000).optional(),
);

const optionalNumber = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.number().positive().max(10_000_000).optional(),
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

const scopeTagSchema = z.string().trim().min(1).max(60);

// Stored and read projects: everything except the title is optional, so old projects
// (title and photos only) keep loading. `description` is the project summary.
export const storedProjectSchema = z.object({
  title: localizedTextSchema,
  category: localizedTextSchema.optional(),
  categoryKey: z.enum(projectCategories).optional(),
  status: z.enum(projectStatuses).optional(),
  location: localizedTextSchema.optional(),
  year: optionalText,
  client: localizedTextSchema.optional(),
  area: optionalNumber,
  duration: localizedTextSchema.optional(),
  scope: z.array(scopeTagSchema).max(12).optional(),
  description: localizedTextSchema.optional(),
  challenge: localizedTextSchema.optional(),
  solution: localizedTextSchema.optional(),
  result: localizedTextSchema.optional(),
  photos: z.array(projectPhotoSchema).max(MAX_PROJECT_PHOTOS),
  beforePhotos: z.array(projectPhotoSchema).max(MAX_PROJECT_PHOTOS).optional(),
  showOnHome: z.boolean(),
});

export const projectInputSchema = storedProjectSchema.extend({
  photos: z.array(projectPhotoSchema).min(1).max(MAX_PROJECT_PHOTOS),
});

export const projectOrderSchema = z.object({
  ids: z.array(z.string().min(1)),
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;
export type ProjectPhoto = z.infer<typeof projectPhotoSchema>;
export type ProjectInput = z.infer<typeof projectInputSchema>;

export type Project = z.infer<typeof storedProjectSchema> & {
  id: string;
  order: number;
};

export type ProjectsSite = {
  siteId: string;
  locales: ("en" | "ar")[];
  defaultLocale: "en" | "ar";
  services: string[];
};
