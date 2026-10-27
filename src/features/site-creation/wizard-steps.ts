export const wizardSteps = [
  { key: "basics" },
  { key: "offer" },
  { key: "details" },
  { key: "review" },
] as const;

export type WizardStepKey = (typeof wizardSteps)[number]["key"];
