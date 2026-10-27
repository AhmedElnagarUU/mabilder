import { z } from "zod";
import { linkSchema, nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const ctaSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText,
  primary: linkSchema,
  secondary: linkSchema.optional(),
});

export type CtaProps = z.infer<typeof ctaSchema>;

export const ctaBlock = {
  type: "cta" as const,
  kind: "copy",
  variants: ["dark", "light"] as const,
  schema: ctaSchema,
  needs: () => true,
  fixtures: {
    full: {
      eyebrow: "Next step",
      title: "A short conversation is usually enough to know.",
      body: "Tell us about the site, the brief, or the problem you are trying to solve. We will respond within two working days with an honest view and a suggested next step.",
      primary: { label: "Book a call", href: "contact.html" },
      secondary: { label: "See our work", href: "projects.html" },
    },
    minimal: {
      title: "Tell us what you are trying to build.",
      body: "We take on a limited number of commissions each year so that every project receives the attention it deserves.",
      primary: { label: "Start a conversation", href: "contact.html" },
    },
  },
} satisfies BlockDefinition<CtaProps>;
