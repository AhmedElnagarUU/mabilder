"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/shared/ui/button";
import {
  isValidTrackingId,
  trackingFields,
  type TrackingField,
  type TrackingSettings,
} from "../types";

type Values = Record<TrackingField, string>;

function toValues(settings: TrackingSettings): Values {
  return Object.fromEntries(
    trackingFields.map((field) => [field, settings[field] ?? ""]),
  ) as Values;
}

function findInvalidFields(values: Values): TrackingField[] {
  return trackingFields.filter(
    (field) => values[field] !== "" && !isValidTrackingId(field, values[field]),
  );
}

export function TrackingForm({
  siteId,
  initial,
}: {
  siteId: string;
  initial: TrackingSettings;
}) {
  const t = useTranslations("tracking");
  const [values, setValues] = useState<Values>(toValues(initial));
  const [invalid, setInvalid] = useState<TrackingField[]>([]);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  function handleChange(field: TrackingField, value: string): void {
    setValues((current) => ({ ...current, [field]: value.trim() }));
    setInvalid((current) => current.filter((item) => item !== field));
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaved(false);
    setError("");

    const problems = findInvalidFields(values);
    setInvalid(problems);

    if (problems.length > 0) {
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(`/api/sites/${siteId}/tracking`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        setSaved(true);
      } else {
        const result = (await response.json()) as { code?: string };
        setError(t(result.code === "save_failed" ? "errors.save_failed" : "errors.default"));
      }
    } catch {
      setError(t("errors.default"));
    }

    setBusy(false);
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      noValidate
      className="mt-6 grid max-w-2xl gap-5"
    >
      {trackingFields.map((field) => {
        const hasError = invalid.includes(field);

        return (
          <div key={field} className="grid gap-1.5">
            <label htmlFor={`tracking-${field}`} className="text-base text-ink">
              {t(`fields.${field}.label`)}
            </label>
            <input
              id={`tracking-${field}`}
              type="text"
              dir="ltr"
              autoComplete="off"
              spellCheck={false}
              value={values[field]}
              onChange={(event) => handleChange(field, event.target.value)}
              placeholder={t(`fields.${field}.placeholder`)}
              aria-invalid={hasError}
              aria-describedby={`tracking-${field}-help`}
              className={`h-11 rounded-xl border bg-white/[0.03] px-3.5 text-start text-base text-ink outline-none placeholder:text-faint focus:border-accent/50 ${
                hasError ? "border-danger/50" : "border-line"
              }`}
            />
            {hasError ? (
              <p role="alert" className="text-sm text-danger">
                {t("errors.invalid")}
              </p>
            ) : null}
            <details className="text-sm text-muted">
              <summary className="cursor-pointer text-dim">{t("help")}</summary>
              <p id={`tracking-${field}-help`} className="mt-1.5 leading-relaxed">
                {t(`fields.${field}.help`)}
              </p>
            </details>
          </div>
        );
      })}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className={buttonClass("primary", "md", "px-6")}
        >
          {busy ? t("saving") : t("save")}
        </button>
        {saved ? (
          <span role="status" className="text-sm text-ok">
            {t("saved")}
          </span>
        ) : null}
        {error ? (
          <span role="alert" className="text-sm text-danger">
            {error}
          </span>
        ) : null}
      </div>
    </form>
  );
}
