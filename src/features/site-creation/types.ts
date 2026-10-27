import { z } from "zod";
import type { SiteContent } from "../static-site-generator/content/types";

const requiredText = z.string().trim().min(1).max(3000);

const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z
    .string()
    .trim()
    .max(3000)
    .nullish()
    .transform((value) => value ?? undefined),
);

export const businessBriefSchema = z.object({
  businessName: requiredText,
  industry: requiredText,
  description: requiredText,
  services: optionalText,
  audience: optionalText,
  location: optionalText,
  tone: optionalText,
  email: optionalText,
  phone: optionalText,
  website: optionalText,
  yearsInBusiness: optionalText,
  awards: optionalText,
  notableClients: optionalText,
  projectCount: optionalText,
  extraDetails: optionalText,
});

export type BusinessBrief = z.infer<typeof businessBriefSchema>;

export const siteStatusSchema = z.enum([
  "draft",
  "generating",
  "ready",
  "error",
]);

export type SiteStatus = z.infer<typeof siteStatusSchema>;

export type SiteSummary = {
  id: string;
  slug: string;
  businessName: string;
  industry: string;
  status: SiteStatus;
  updatedAt: string;
};

export type SiteRecord = SiteSummary & {
  brief: BusinessBrief;
  content: SiteContent | null;
  error: string | null;
  createdAt: string;
};
