"use client";

import { useState } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Field, TextAreaField } from "@/shared/ui/field";
import type { PaymentSettings } from "../../billing/settings/types";

type Wallet = PaymentSettings["wallets"][number];

const walletLabels: Record<Wallet["method"], string> = {
  vodafone_cash: "Vodafone Cash",
  other_wallet: "Other wallet",
};

export function PaymentSettingsForm({ initial }: { initial: PaymentSettings }) {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>(initial.wallets);
  const [instapayAddress, setInstapayAddress] = useState(initial.instapayAddress);
  const [instructionsEn, setInstructionsEn] = useState(initial.instructions.en);
  const [instructionsAr, setInstructionsAr] = useState(initial.instructions.ar);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function updateWallet(index: number, change: Partial<Wallet>) {
    setWallets((current) => current.map((wallet, i) => (i === index ? { ...wallet, ...change } : wallet)));
  }

  async function save() {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/settings/payment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallets,
          instapayAddress,
          instructions: { en: instructionsEn, ar: instructionsAr },
        }),
      });

      setMessage(response.ok ? "Saved." : "Could not save. Check the wallet numbers and text lengths.");

      if (response.ok) {
        router.refresh();
      }
    } catch {
      setMessage("Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Wallets</h2>
        {wallets.map((wallet, index) => (
          <div key={index} className="grid gap-3 sm:grid-cols-[10rem_1fr_1fr_auto] sm:items-end">
            <select
              aria-label="Wallet type"
              value={wallet.method}
              onChange={(event) => updateWallet(index, { method: event.target.value as Wallet["method"] })}
              className="h-11 rounded-xl border border-line bg-white/[0.025] px-3 text-sm text-ink"
            >
              {Object.entries(walletLabels).map(([method, label]) => (
                <option key={method} value={method}>
                  {label}
                </option>
              ))}
            </select>
            <Field label="Number" value={wallet.number} onChange={(number) => updateWallet(index, { number })} />
            <Field label="Account name" value={wallet.name} onChange={(name) => updateWallet(index, { name })} />
            <button
              type="button"
              onClick={() => setWallets((current) => current.filter((_, i) => i !== index))}
              className={buttonClass("ghost", "md")}
            >
              Remove
            </button>
          </div>
        ))}
        <div>
          <button
            type="button"
            onClick={() => setWallets((current) => [...current, { method: "vodafone_cash", number: "", name: "" }])}
            className={buttonClass("secondary", "sm")}
          >
            Add wallet
          </button>
        </div>
      </div>

      <Field label="InstaPay address" value={instapayAddress} onChange={setInstapayAddress} />
      <TextAreaField label="Instructions (English)" value={instructionsEn} onChange={setInstructionsEn} rows={4} />
      <TextAreaField label="Instructions (Arabic)" value={instructionsAr} onChange={setInstructionsAr} rows={4} />

      <div className="flex items-center gap-3">
        <button type="button" onClick={() => void save()} disabled={busy} className={buttonClass("accent", "md")}>
          {busy ? "Saving..." : "Save settings"}
        </button>
        {message ? (
          <p role="status" className="text-sm text-muted">
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
