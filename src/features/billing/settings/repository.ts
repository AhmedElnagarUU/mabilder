import { connectToDatabase } from "../../../shared/db/mongoose";
import { SettingsModel } from "./model";
import { EMPTY_PAYMENT_SETTINGS, type PaymentSettings } from "./types";

const PAYMENT_SETTINGS_ID = "payment";

export async function findPaymentSettings(): Promise<PaymentSettings> {
  await connectToDatabase();

  const doc = await SettingsModel.findById(PAYMENT_SETTINGS_ID).lean();

  if (!doc) {
    return EMPTY_PAYMENT_SETTINGS;
  }

  return {
    wallets: doc.wallets.map(({ method, number, name }) => ({ method, number, name: name ?? "" })),
    instapayAddress: doc.instapayAddress ?? "",
    instructions: { en: doc.instructions?.en ?? "", ar: doc.instructions?.ar ?? "" },
  };
}

export async function savePaymentSettings(settings: PaymentSettings): Promise<void> {
  await connectToDatabase();

  await SettingsModel.findOneAndUpdate(
    { _id: PAYMENT_SETTINGS_ID },
    { $set: settings },
    { upsert: true, runValidators: true },
  );
}
