import { z } from "zod";
import { nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const contactSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText,
  form: z.object({
    namePlaceholder: nonEmptyText,
    emailPlaceholder: nonEmptyText,
    messagePlaceholder: nonEmptyText,
    submitLabel: nonEmptyText,
    successMessage: nonEmptyText,
  }),
});

export type ContactProps = z.infer<typeof contactSchema>;

export const contactBlock = {
  type: "contact" as const,
  kind: "copy",
  variants: ["split", "form-only"] as const,
  schema: contactSchema,
  needs: () => true,
  fixtures: {
    full: {
      eyebrow: "Get in Touch",
      title: "Let's build something remarkable.",
      body: "Whether you have a site, a sketch, or just an ambition — we'd love to hear from you.",
      form: {
        namePlaceholder: "Name",
        emailPlaceholder: "Email",
        messagePlaceholder: "Tell us about your project...",
        submitLabel: "Send Inquiry",
        successMessage:
          "Thank you — your enquiry has been noted. In this demo no message is actually sent.",
      },
    },
    minimal: {
      title: "Let's build something remarkable.",
      body: "Tell us about the site, the brief, or the problem you are trying to solve.",
      form: {
        namePlaceholder: "Name",
        emailPlaceholder: "Email",
        messagePlaceholder: "Message",
        submitLabel: "Send",
        successMessage: "Thank you — your enquiry has been noted.",
      },
    },
  },
} satisfies BlockDefinition<ContactProps>;
