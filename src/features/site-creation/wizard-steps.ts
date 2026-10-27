export const wizardSteps = [
  {
    key: "basics",
    title: "Basics",
    description: "Name, industry, and what the business does.",
  },
  {
    key: "offer",
    title: "Offer",
    description: "Services, audience, and tone of voice.",
  },
  {
    key: "details",
    title: "Details",
    description: "Contact, track record, and optional extras.",
  },
  {
    key: "review",
    title: "Review",
    description: "Check the brief before AI writes.",
  },
] as const;

export type WizardStepKey = (typeof wizardSteps)[number]["key"];
