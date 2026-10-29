import { z } from "zod";

export const trackingPatterns = {
  metaPixelId: /^\d{15,16}$/,
  ga4Id: /^G-[A-Z0-9]{6,12}$/,
  tiktokPixelId: /^[A-Z0-9]{20}$/,
  snapPixelId: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  clarityId: /^[a-z0-9]{8,12}$/,
};

export type TrackingField = keyof typeof trackingPatterns;

export const trackingFields = Object.keys(trackingPatterns) as TrackingField[];

export function isValidTrackingId(field: TrackingField, value: string): boolean {
  return trackingPatterns[field].test(value);
}

function optionalId(field: TrackingField) {
  return z
    .string()
    .refine((value) => value === "" || isValidTrackingId(field, value), {
      message: "Invalid ID.",
    })
    .optional();
}

export const trackingSettingsSchema = z.object({
  metaPixelId: optionalId("metaPixelId"),
  ga4Id: optionalId("ga4Id"),
  tiktokPixelId: optionalId("tiktokPixelId"),
  snapPixelId: optionalId("snapPixelId"),
  clarityId: optionalId("clarityId"),
});

export type TrackingSettings = z.infer<typeof trackingSettingsSchema>;
