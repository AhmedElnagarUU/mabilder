import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { WALLET_METHODS } from "./types";

// The `settings` collection holds one document per area; payment settings use the id "payment".
const settingsSchema = new Schema(
  {
    _id: { type: String, required: true },
    wallets: [
      new Schema(
        {
          method: { type: String, enum: WALLET_METHODS, required: true },
          number: { type: String, required: true },
          name: { type: String, default: "" },
        },
        { _id: false },
      ),
    ],
    instapayAddress: { type: String, default: "" },
    instructions: {
      en: { type: String, default: "" },
      ar: { type: String, default: "" },
    },
  },
  { collection: "settings", versionKey: false },
);

export type SettingsDocument = InferSchemaType<typeof settingsSchema>;

export const SettingsModel =
  (models.Settings as Model<SettingsDocument> | undefined) ??
  model<SettingsDocument>("Settings", settingsSchema);
