import { z } from "zod";
import { cardSchema, nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const valuesSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText.optional(),
  items: z.array(cardSchema).min(2).max(6),
});

export type ValuesProps = z.infer<typeof valuesSchema>;

export const valuesBlock = {
  type: "values" as const,
  kind: "copy",
  variants: ["default"] as const,
  schema: valuesSchema,
  needs: () => true,
  fixtures: {
    full: {
      eyebrow: "What we believe",
      title: "Four principles.\nNo exceptions.",
      body: "These are not marketing values. They are the questions we ask in every design review, on every project, at every scale.",
      items: [
        {
          title: "Restraint",
          body: "The most powerful move is often the one we remove. We edit relentlessly so that what remains — a stair, a window, a wall — can be experienced fully.",
        },
        {
          title: "Material honesty",
          body: "Stone should look like stone. Timber should age like timber. We specify materials for how they will look in twenty years, not how they photograph on opening day.",
        },
        {
          title: "Longevity",
          body: "A building is a promise to a place. We design for adaptability, low operational carbon and graceful ageing, testing each scheme against a fifty-year horizon.",
        },
        {
          title: "Collaboration",
          body: "We are not authors working alone. Clients, engineers, craftspeople and future occupants all hold knowledge the building needs.",
        },
      ],
    },
    minimal: {
      title: "Four principles.\nNo exceptions.",
      items: [
        {
          title: "Restraint",
          body: "The most powerful move is often the one we remove.",
        },
        {
          title: "Material honesty",
          body: "Stone should look like stone. Timber should age like timber.",
        },
      ],
    },
  },
} satisfies BlockDefinition<ValuesProps>;
