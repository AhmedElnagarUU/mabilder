import { findPaymentSettings, savePaymentSettings } from "./repository";
import {
  paymentSettingsSchema,
  type PaymentSettings,
  type WalletInfo,
  type WalletLocale,
} from "./types";

// The Pro price in EGP comes only from the environment; null when missing or invalid.
export function getProPriceEgp(): number | null {
  const price = Number(process.env.PRO_PRICE_EGP?.trim());
  return Number.isFinite(price) && price > 0 ? price : null;
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  return findPaymentSettings();
}

// Null when the input is invalid.
export async function updatePaymentSettings(input: unknown): Promise<PaymentSettings | null> {
  const result = paymentSettingsSchema.safeParse(input);

  if (!result.success) {
    return null;
  }

  await savePaymentSettings(result.data);
  return result.data;
}

// Null hides the wallet option on the billing page: no price means nothing to pay.
export async function getWalletInfo(locale: WalletLocale): Promise<WalletInfo | null> {
  const priceEgp = getProPriceEgp();

  if (priceEgp === null) {
    return null;
  }

  const settings = await findPaymentSettings();

  return {
    priceEgp,
    wallets: settings.wallets,
    instapayAddress: settings.instapayAddress,
    instructions: settings.instructions[locale],
  };
}
