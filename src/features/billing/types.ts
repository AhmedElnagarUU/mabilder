import { z } from "zod";

export const SUBSCRIPTION_PROVIDERS = ["polar", "manual"] as const;

export type SubscriptionProvider = (typeof SUBSCRIPTION_PROVIDERS)[number];

export type SubscriptionRecord = {
  userId: string;
  provider: SubscriptionProvider;
  status: string;
  currentPeriodEnd: Date;
  externalId?: string;
};

export type AccessState = "trial" | "active" | "expired";

export type Access = {
  state: AccessState;
  trialEndsAt?: Date;
  renewsAt?: Date;
  canceled?: boolean;
};

export const billingLocaleSchema = z.object({
  locale: z.enum(["en", "ar"]).default("en"),
});

export type BillingLocale = z.output<typeof billingLocaleSchema>["locale"];
