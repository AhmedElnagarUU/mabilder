import { z } from "zod";
import { nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const clientsSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText.optional(),
  names: z.array(nonEmptyText),
});

export type ClientsProps = z.infer<typeof clientsSchema>;

export const clientsBlock = {
  type: "clients" as const,
  kind: "fact",
  variants: ["default"] as const,
  schema: clientsSchema,
  needs: (facts) => facts.clients.length >= 3,
  fixtures: {
    full: {
      eyebrow: "Selected clients",
      title: "Trusted with the brief.",
      body: "Private families, family offices, developers and cultural institutions. Many have worked with us for more than a decade.",
      names: [
        "Meridian Holdings",
        "Kant Immobilien",
        "Fondazione Lago",
        "Nord Atelier",
        "Selva Collection",
        "Hoffmann Group",
        "Casa Luce Trust",
        "Tide Foundation",
      ],
    },
    minimal: {
      title: "Trusted with the brief.",
      names: ["Meridian Holdings", "Kant Immobilien", "Fondazione Lago"],
    },
  },
} satisfies BlockDefinition<ClientsProps>;
