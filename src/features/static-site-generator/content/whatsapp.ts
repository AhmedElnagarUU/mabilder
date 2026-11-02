import { z } from "zod";
import type { Locale } from "../locale";

const PHONE_PATTERN = /^[0-9+\s()-]{7,20}$/;
const MIN_DIGITS = 8;
const MAX_DIGITS = 15;

export const whatsappSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  number: z
    .string()
    .trim()
    .refine((value) => value === "" || PHONE_PATTERN.test(value), "Enter a valid phone number.")
    .optional(),
});

export type WhatsAppSettings = { enabled: boolean; number?: string };

export const whatsappMessages: Record<Locale, string> = {
  en: "Hello, I found your website and would like to ask about your services.",
  ar: "مرحبًا، زرت موقعكم وأود الاستفسار عن خدماتكم.",
};

export const whatsappLabels: Record<Locale, string> = {
  en: "Chat on WhatsApp",
  ar: "تواصل عبر واتساب",
};

// The button is opt-in: stored settings are read leniently and a missing or bad value means "off".
export function readWhatsAppSettings(value: unknown): WhatsAppSettings {
  const parsed = whatsappSettingsSchema.safeParse(value ?? {});

  if (!parsed.success) {
    return { enabled: false };
  }

  return { enabled: parsed.data.enabled, number: parsed.data.number || undefined };
}

// wa.me wants the full number as digits only; an Egyptian "01…" number gets the 20 prefix.
export function toWhatsAppDigits(phone: string): string | null {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("01") && digits.length === 11) {
    digits = `20${digits.slice(1)}`;
  }

  return digits.length >= MIN_DIGITS && digits.length <= MAX_DIGITS ? digits : null;
}

export function buildWhatsAppUrl(phone: string, locale: Locale): string | null {
  const digits = toWhatsAppDigits(phone);

  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(whatsappMessages[locale])}` : null;
}

// The button shows only when the owner switched it on and there is a number: the separate one, else the site phone.
// No settings (gallery demo, template previews) means no button.
export function resolveWhatsAppUrl(
  settings: WhatsAppSettings | undefined,
  sitePhone: string | undefined,
  locale: Locale,
): string | null {
  const resolved = settings ?? { enabled: false };
  const phone = resolved.number || sitePhone;

  return resolved.enabled && phone ? buildWhatsAppUrl(phone, locale) : null;
}
