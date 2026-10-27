import { z } from "zod";
import { nonEmptyText } from "./common";
import type { BlockDefinition } from "./types";

export const locationSchema = z.object({
  eyebrow: nonEmptyText.optional(),
  title: nonEmptyText,
  body: nonEmptyText.optional(),
  address: nonEmptyText,
  email: nonEmptyText.optional(),
  phone: nonEmptyText.optional(),
  mapHref: z
    .string()
    .trim()
    .refine(
      (value) => value.startsWith("https://") || value.startsWith("http://"),
      "Use an http(s) map link.",
    ),
});

export type LocationProps = z.infer<typeof locationSchema>;

export const locationBlock = {
  type: "location" as const,
  kind: "fact",
  variants: ["default"] as const,
  schema: locationSchema,
  needs: (facts) => facts.address !== undefined,
  fixtures: {
    full: {
      eyebrow: "Studios",
      title: "Two cities, one practice",
      body: "Both studios are open to visitors by appointment. If you are nearby, we would rather meet in person.",
      address: "Bahnhofstrasse 42, 8001 Zürich, Switzerland",
      email: "zurich@agenvo.com",
      phone: "+41 44 123 4567",
      mapHref: "https://maps.google.com/?q=Bahnhofstrasse+42+8001+Zurich",
    },
    minimal: {
      title: "Our studio",
      address: "Bahnhofstrasse 42, 8001 Zürich, Switzerland",
      mapHref: "https://maps.google.com/?q=Bahnhofstrasse+42+8001+Zurich",
    },
  },
} satisfies BlockDefinition<LocationProps>;
