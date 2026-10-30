"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Field, TextAreaField } from "@/shared/ui/field";
import type { PaymentSettings } from "../../billing/settings/types";
import { WalletList, type Wallet } from "./wallet-list";

type Message = { kind: "ok" | "error"; text: string };

function Section({ title, message, children }: { title: string; message?: Message; children: ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
      {message ? (
        <p role="status" className={`mt-4 text-sm ${message.kind === "ok" ? "text-ok" : "text-danger"}`}>
          {message.text}
        </p>
      ) : null}
    </Card>
  );
}

function TextValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-2">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-sm whitespace-pre-wrap">{value || "Not set"}</p>
    </div>
  );
}

export function PaymentSettingsForm({ initial }: { initial: PaymentSettings }) {
  const router = useRouter();
  const [settings, setSettings] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [walletMessage, setWalletMessage] = useState<Message>();
  const [textMessage, setTextMessage] = useState<Message>();
  const [editingText, setEditingText] = useState(false);
  const [instapayAddress, setInstapayAddress] = useState(initial.instapayAddress);
  const [instructionsEn, setInstructionsEn] = useState(initial.instructions.en);
  const [instructionsAr, setInstructionsAr] = useState(initial.instructions.ar);

  async function save(next: PaymentSettings, report: (message: Message) => void): Promise<boolean> {
    setBusy(true);

    try {
      const response = await fetch("/api/admin/settings/payment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });

      if (!response.ok) {
        report({ kind: "error", text: "Could not save. Check the wallet numbers and text lengths." });
        return false;
      }

      setSettings((await response.json()) as PaymentSettings);
      report({ kind: "ok", text: "Saved." });
      router.refresh();
      return true;
    } catch {
      report({ kind: "error", text: "Could not save. Try again." });
      return false;
    } finally {
      setBusy(false);
    }
  }

  function saveWallets(wallets: Wallet[]) {
    return save({ ...settings, wallets }, setWalletMessage);
  }

  async function saveText() {
    const saved = await save(
      { ...settings, instapayAddress, instructions: { en: instructionsEn, ar: instructionsAr } },
      setTextMessage,
    );

    if (saved) {
      setEditingText(false);
    }
  }

  function startEditingText() {
    setInstapayAddress(settings.instapayAddress);
    setInstructionsEn(settings.instructions.en);
    setInstructionsAr(settings.instructions.ar);
    setTextMessage(undefined);
    setEditingText(true);
  }

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <Section title="Wallets" message={walletMessage}>
        <WalletList wallets={settings.wallets} busy={busy} onChange={saveWallets} />
      </Section>

      <Section title="InstaPay and instructions" message={textMessage}>
        {editingText ? (
          <div className="flex flex-col gap-4">
            <Field label="InstaPay address" value={instapayAddress} onChange={setInstapayAddress} />
            <TextAreaField label="Instructions (English)" value={instructionsEn} onChange={setInstructionsEn} rows={4} />
            <TextAreaField label="Instructions (Arabic)" value={instructionsAr} onChange={setInstructionsAr} rows={4} />
            <div className="flex gap-2">
              <button type="button" onClick={() => void saveText()} disabled={busy} className={buttonClass("accent", "md")}>
                {busy ? "Saving..." : "Save"}
              </button>
              <button type="button" onClick={() => setEditingText(false)} className={buttonClass("ghost", "md")}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-line-soft">
              <TextValue label="InstaPay address" value={settings.instapayAddress} />
              <TextValue label="Instructions (English)" value={settings.instructions.en} />
              <TextValue label="Instructions (Arabic)" value={settings.instructions.ar} />
            </div>
            <div className="mt-4">
              <button type="button" onClick={startEditingText} className={buttonClass("secondary", "sm")}>
                Edit
              </button>
            </div>
          </>
        )}
      </Section>
    </div>
  );
}
