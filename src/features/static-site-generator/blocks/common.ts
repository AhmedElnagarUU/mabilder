import { z } from "zod";
import { isSafeHref, isSafeImageUrl } from "../content/html";

export const nonEmptyText = z.string().trim().min(1);

const href = z
  .string()
  .trim()
  .refine(
    isSafeHref,
    "Use a generated page, anchor, mailto, tel, or http(s) link.",
  );

const imageUrl = z
  .string()
  .trim()
  .refine(isSafeImageUrl, "Use an http(s) image URL.");

const httpUrl = z.string().trim().refine(isSafeImageUrl, "Use an http(s) link.");

export const imageSchema = z.object({
  src: imageUrl,
  alt: nonEmptyText,
  credit: z
    .object({
      name: nonEmptyText,
      url: httpUrl,
    })
    .optional(),
});

export const linkSchema = z.object({
  label: nonEmptyText,
  href,
});

export const cardSchema = z.object({
  title: nonEmptyText,
  body: nonEmptyText,
  icon: nonEmptyText.optional(),
});

export const statSchema = z.object({
  value: nonEmptyText,
  label: nonEmptyText,
});

export const faqItemSchema = z.object({
  question: nonEmptyText,
  answer: nonEmptyText,
});

export type Image = z.infer<typeof imageSchema>;
export type Link = z.infer<typeof linkSchema>;
export type Card = z.infer<typeof cardSchema>;
export type Stat = z.infer<typeof statSchema>;
export type FaqItem = z.infer<typeof faqItemSchema>;
