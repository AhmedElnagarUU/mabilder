import { createPolar, webhooks, type Polar } from "@polar-sh/sdk/2026-10";

export class BillingNotConfiguredError extends Error {
  constructor() {
    super("Billing is not configured.");
  }
}

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new BillingNotConfiguredError();
  }

  return value;
}

export function getProductId(): string {
  return requireEnv("POLAR_PRODUCT_ID_PRO");
}

export function getPolar(): Polar {
  return createPolar({
    accessToken: requireEnv("POLAR_ACCESS_TOKEN"),
    environment: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
  });
}

export function verifyWebhook(body: string, headers: Record<string, string>) {
  return webhooks.validateEvent(body, headers, requireEnv("POLAR_WEBHOOK_SECRET"));
}

export const isWebhookSignatureError = (error: unknown) =>
  error instanceof webhooks.PolarWebhookVerificationError;

export const isUnknownWebhookTypeError = (error: unknown) =>
  error instanceof webhooks.PolarWebhookUnknownTypeError;

export const isWebhookError = (error: unknown) => error instanceof webhooks.PolarWebhookError;
