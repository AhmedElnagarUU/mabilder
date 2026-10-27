import { z } from "zod";
import { faqItemSchema, nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const faqSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText.optional(),
  items: z.array(faqItemSchema).min(3).max(8),
});

export type FaqProps = z.infer<typeof faqSchema>;

export const faqBlock = {
  type: "faq" as const,
  kind: "copy",
  variants: ["default"] as const,
  schema: faqSchema,
  needs: () => true,
  fixtures: {
    full: {
      eyebrow: "Common questions",
      title: "Before you write.",
      body: "A few things clients ask us most often. If your question is not here, ask it directly — we answer every enquiry personally.",
      items: [
        {
          question: "Do you work outside Switzerland and the UAE?",
          answer:
            "Yes. We have built in sixteen countries across Europe, the Middle East and Asia. For projects further afield we usually partner with a local architect of record while retaining design leadership.",
        },
        {
          question: "What size projects do you take on?",
          answer:
            "Our work ranges from a single room or staircase to masterplans of several hundred thousand square metres. What matters is whether the project offers a genuine design question.",
        },
        {
          question: "How early should we contact you?",
          answer:
            "As early as possible — ideally before you have purchased a site. A feasibility conversation can save significant cost and heartache later.",
        },
        {
          question: "Can you work with our existing architect or contractor?",
          answer:
            "Frequently. We provide design review, engineering, interiors or sustainability input to projects led by others, and we are happy to work alongside your contractor from the outset.",
        },
        {
          question: "How do you approach sustainability?",
          answer:
            "As a design constraint, not an add-on. We set carbon budgets early, prioritise retention and low-carbon materials, model daylight and energy performance throughout, and report actual performance after occupancy.",
        },
        {
          question: "Do you take on interior-only projects?",
          answer:
            "Yes. Interior architecture is a full service in its own right, led by Amara Okafor. We take on complete homes, hospitality interiors, and focused commissions.",
        },
      ],
    },
    minimal: {
      title: "Before you write.",
      items: [
        {
          question: "Do you work outside Switzerland and the UAE?",
          answer:
            "Yes. We have built in sixteen countries across Europe, the Middle East and Asia.",
        },
        {
          question: "What size projects do you take on?",
          answer:
            "Our work ranges from a single room or staircase to masterplans of several hundred thousand square metres.",
        },
        {
          question: "How early should we contact you?",
          answer:
            "As early as possible — ideally before you have purchased a site.",
        },
      ],
    },
  },
} satisfies BlockDefinition<FaqProps>;
