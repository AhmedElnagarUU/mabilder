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
    phonePlaceholder: nonEmptyText.optional(),
    serviceLabel: nonEmptyText.optional(),
    locationPlaceholder: nonEmptyText.optional(),
    budgetLabel: nonEmptyText.optional(),
    startLabel: nonEmptyText.optional(),
    privacyNote: nonEmptyText.optional(),
    errorMessage: nonEmptyText.optional(),
    quoteTabLabel: nonEmptyText.optional(),
    visitTabLabel: nonEmptyText.optional(),
    visitSubmitLabel: nonEmptyText.optional(),
    visitDayLabel: nonEmptyText.optional(),
    visitTimeLabel: nonEmptyText.optional(),
    visitMorningLabel: nonEmptyText.optional(),
    visitEveningLabel: nonEmptyText.optional(),
    visitNotePlaceholder: nonEmptyText.optional(),
    visitSuccessMessage: nonEmptyText.optional(),
  }),
});

export type ContactProps = z.infer<typeof contactSchema>;

export const contactBlock = {
  type: "contact" as const,
  kind: "copy",
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
        successMessage: "Thank you — we received your request and will call you soon.",
        phonePlaceholder: "Phone number",
        serviceLabel: "Service",
        locationPlaceholder: "Project location",
        budgetLabel: "Budget",
        startLabel: "When do you want to start?",
        privacyNote: "We only use your details to reply to you.",
        errorMessage: "Something went wrong. Please check your details and try again.",
        quoteTabLabel: "Request a quote",
        visitTabLabel: "Book a site visit",
        visitSubmitLabel: "Request a visit",
        visitDayLabel: "Preferred day",
        visitTimeLabel: "Preferred time",
        visitMorningLabel: "Morning",
        visitEveningLabel: "Evening",
        visitNotePlaceholder: "Anything we should know before the visit?",
        visitSuccessMessage: "Thank you — we received your visit request and will call you to confirm.",
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
        successMessage: "Thank you — we received your request and will call you soon.",
      },
    },
  },
} satisfies BlockDefinition<ContactProps>;
