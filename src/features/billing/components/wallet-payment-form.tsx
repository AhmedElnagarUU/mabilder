"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Field, inputClass, labelClass } from "@/shared/ui/field";
import { PAYMENT_METHODS, type PaymentMethod } from "../payments/types";

const errorCodes = new Set(["invalid_request", "payment_pending", "payments_unavailable", "unauthorized"]);

export function WalletPaymentForm({ priceEgp }: { priceEgp: number }) {
  const t = useTranslations("billing.wallet");
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("vodafone_cash");
  const [amount, setAmount] = useState(String(priceEgp));
  const [reference, setReference] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/billing/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          amount: Number(amount),
          reference,
          senderPhone: senderPhone.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const result = (await response.json()) as { code?: string };
        setError(t(`errors.${result.code && errorCodes.has(result.code) ? result.code : "default"}`));
        return;
      }

      router.refresh();
    } catch {
      setError(t("errors.default"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} className="mt-4 flex flex-col gap-4">
      <label className="block">
        <span className={labelClass}>{t("method")}</span>
        <select
          value={method}
          onChange={(event) => setMethod(event.target.value as PaymentMethod)}
          className={inputClass}
        >
          {PAYMENT_METHODS.map((value) => (
            <option key={value} value={value}>
              {t(value)}
            </option>
          ))}
        </select>
      </label>
      <Field label={t("amount")} value={amount} onChange={setAmount} type="number" required />
      <Field
        label={t("reference")}
        value={reference}
        onChange={setReference}
        placeholder={t("referencePlaceholder")}
        required
      />
      <Field label={t("senderPhone")} value={senderPhone} onChange={setSenderPhone} type="tel" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className={buttonClass("primary", "md")}>
          {busy ? t("sending") : t("submit")}
        </button>
        {error ? (
          <span role="alert" className="text-[13px] text-danger">
            {error}
          </span>
        ) : null}
      </div>
    </form>
  );
}
