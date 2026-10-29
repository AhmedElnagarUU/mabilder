import { z } from "zod";

export const WALLET_METHODS = ["vodafone_cash", "other_wallet"] as const;

export const paymentSettingsSchema = z.object({
  wallets: z
    .array(
      z.object({
        method: z.enum(WALLET_METHODS),
        number: z.string().trim().min(1).max(40),
        name: z.string().trim().max(80).default(""),
      }),
    )
    .max(10),
  instapayAddress: z.string().trim().max(100).default(""),
  instructions: z.object({
    en: z.string().trim().max(1000).default(""),
    ar: z.string().trim().max(1000).default(""),
  }),
});

export type PaymentSettings = z.output<typeof paymentSettingsSchema>;

export const EMPTY_PAYMENT_SETTINGS: PaymentSettings = {
  wallets: [],
  instapayAddress: "",
  instructions: { en: "", ar: "" },
};

export type WalletLocale = "en" | "ar";

// What the customer billing page needs.
export type WalletInfo = {
  priceEgp: number;
  wallets: PaymentSettings["wallets"];
  instapayAddress: string;
  instructions: string;
};
