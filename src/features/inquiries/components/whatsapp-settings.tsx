"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import type { WhatsAppSettings } from "@/features/static-site-generator/content/whatsapp";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { inputClass, labelClass } from "@/shared/ui/field";
import { sendInquiryRequest } from "./inquiry-request";

export function WhatsAppSettingsForm({
  siteId,
  initial,
  sitePhone,
}: {
  siteId: string;
  initial: WhatsAppSettings;
  sitePhone?: string;
}) {
  const t = useTranslations("inbox.whatsapp");
  const [enabled, setEnabled] = useState(initial.enabled);
  const [number, setNumber] = useState(initial.number ?? sitePhone ?? "");
  const [liveNumber, setLiveNumber] = useState(initial.enabled ? (initial.number ?? sitePhone ?? "") : "");
  const [live, setLive] = useState(initial.enabled);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (enabled && number.trim() === "") {
      setSaved(false);
      setError(t("errors.numberRequired"));
      return;
    }

    setBusy(true);
    setSaved(false);
    setError("");

    const failure = await sendInquiryRequest(`/api/sites/${siteId}/whatsapp`, "PUT", {
      enabled,
      number: number.trim(),
    });

    setBusy(false);

    if (failure) {
      setError(t(failure === "invalid_request" ? "errors.invalid" : "errors.default"));
      return;
    }

    setLive(enabled);
    setLiveNumber(number.trim());
    setSaved(true);
  }

  return (
    <div data-tour="inbox-whatsapp" className="mt-6 max-w-2xl">
      <Card className="p-5">
        <form onSubmit={(event) => void save(event)} className="flex flex-col gap-3">
          <h2 className="text-base font-medium text-ink">{t("title")}</h2>
          <p data-whatsapp-status className="text-sm font-medium text-ink">
            {live ? t("statusOn", { number: liveNumber }) : t("statusOff")}
          </p>
          <p className="text-sm text-muted">
            {sitePhone ? t("description", { phone: sitePhone }) : t("descriptionNoPhone")}
          </p>

          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
              className="h-4 w-4 accent-[#5eead4]"
            />
            {t("enabled")}
          </label>

          {enabled ? (
            <label className="block">
              <span className={labelClass}>{t("numberLabel")}</span>
              <input
                type="tel"
                dir="ltr"
                value={number}
                onChange={(event) => setNumber(event.target.value)}
                placeholder={t("numberPlaceholder")}
                required
                className={`${inputClass} text-start`}
              />
            </label>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" disabled={busy} className={buttonClass("primary", "md", "px-6")}>
              {busy ? t("saving") : t("save")}
            </button>
            {saved ? <span role="status" className="text-sm text-ok">{t("saved")}</span> : null}
            {error ? <span role="alert" className="text-sm text-danger">{error}</span> : null}
          </div>
        </form>
      </Card>
    </div>
  );
}
