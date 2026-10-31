"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Icon } from "@/shared/ui/icon";
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

export function TrackingForm({
  siteId,
  initial,
}: {
  siteId: string;
  initial: TrackingSettings;
}) {
  const t = useTranslations("tracking");
  const [values, setValues] = useState<Values>(toValues(initial));
  const [editing, setEditing] = useState<TrackingField | null>(null);
  const [draft, setDraft] = useState("");
  const [invalid, setInvalid] = useState(false);
  const [deleting, setDeleting] = useState<TrackingField | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const connected = trackingFields.filter((field) => values[field] !== "");
  const available = trackingFields.filter((field) => values[field] === "");

  function fieldLabel(field: TrackingField): string {
    return t(`fields.${field}.label`);
  }

  function openPanel(field: TrackingField): void {
    setEditing(field);
    setDraft(values[field]);
    setInvalid(false);
    setSaved(false);
    setError("");
  }

  function closePanel(): void {
    setEditing(null);
    setInvalid(false);
  }

  async function persist(nextValues: Values): Promise<boolean> {
    setSaved(false);
    setError("");
    setBusy(true);

    try {
      const response = await fetch(`/api/sites/${siteId}/tracking`, {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(nextValues),
      });

      if (response.ok) {
        setValues(nextValues);
        setSaved(true);
        return true;
      }

      const result = (await response.json()) as { code?: string };
      setError(t(result.code === "save_failed" ? "errors.save_failed" : "errors.default"));
    } catch {
      setError(t("errors.default"));
    } finally {
      setBusy(false);
    }

    return false;
  }

  async function savePanel(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!editing) {
      return;
    }

    const value = draft.trim();

    if (value === "" || !isValidTrackingId(editing, value)) {
      setInvalid(true);
      return;
    }

    if (await persist({ ...values, [editing]: value })) {
      closePanel();
    }
  }

  async function deleteConnection(): Promise<void> {
    if (!deleting) {
      return;
    }

    const ok = await persist({ ...values, [deleting]: "" });

    if (ok && editing === deleting) {
      closePanel();
    }

    setDeleting(null);
  }

  return (
    <div data-tour="tracking-fields" className="mt-6 flex max-w-2xl flex-col gap-5">
      <Card className="p-5">
        <h2 className="text-base font-medium text-ink">{t("connected.title")}</h2>

        {connected.length > 0 ? (
          <ul className="mt-3 flex flex-col divide-y divide-line-soft">
            {connected.map((field) => (
              <li
                key={field}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm text-ink">{fieldLabel(field)}</p>
                  <p dir="ltr" className="mt-0.5 truncate font-mono text-xs text-muted">
                    {values[field]}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openPanel(field)}
                    disabled={busy}
                    className={buttonClass("secondary", "sm")}
                  >
                    {t("actions.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleting(field)}
                    disabled={busy}
                    className={buttonClass("danger", "sm")}
                  >
                    {t("actions.delete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">{t("connected.empty")}</p>
        )}
      </Card>

      <section className="flex flex-col gap-2">
        <h2 className="text-base font-medium text-ink">{t("connect.title")}</h2>
        {available.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {available.map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => openPanel(field)}
                disabled={busy}
                className={buttonClass("secondary", "sm")}
              >
                <Icon name="plus" className="h-3.5 w-3.5" />
                {fieldLabel(field)}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">{t("connect.allConnected")}</p>
        )}
      </section>

      {editing ? (
        <Card className="p-5">
          <form onSubmit={(event) => void savePanel(event)} noValidate className="flex flex-col gap-3">
            <h2 className="text-base font-medium text-ink">{fieldLabel(editing)}</h2>

            <div className="grid gap-1.5">
              <label htmlFor="tracking-id" className="text-base text-ink">
                {t("idLabel")}
              </label>
              <input
                id="tracking-id"
                type="text"
                dir="ltr"
                autoComplete="off"
                spellCheck={false}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value.trim());
                  setInvalid(false);
                }}
                placeholder={t(`fields.${editing}.placeholder`)}
                aria-invalid={invalid}
                aria-describedby="tracking-id-help"
                className={`h-11 rounded-xl border bg-white/[0.03] px-3.5 text-start text-base text-ink outline-none placeholder:text-faint focus:border-accent/50 ${
                  invalid ? "border-danger/50" : "border-line"
                }`}
              />
              {invalid ? (
                <p role="alert" className="text-sm text-danger">
                  {t("errors.invalid")}
                </p>
              ) : null}
              <details className="text-sm text-muted">
                <summary className="cursor-pointer text-dim">{t("help")}</summary>
                <p id="tracking-id-help" className="mt-1.5 leading-relaxed">
                  {t(`fields.${editing}.help`)}
                </p>
              </details>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                data-tour="tracking-save"
                disabled={busy}
                className={buttonClass("primary", "md", "px-6")}
              >
                {busy ? t("saving") : t("save")}
              </button>
              <button
                type="button"
                onClick={closePanel}
                disabled={busy}
                className={buttonClass("ghost", "md")}
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="min-h-5 text-sm">
        {saved ? (
          <span role="status" className="text-ok">
            {t("saved")}
          </span>
        ) : null}
        {error ? (
          <span role="alert" className="text-danger">
            {error}
          </span>
        ) : null}
      </div>

      {deleting ? (
        <ConfirmDialog
          title={t("deleteConfirm.title")}
          description={t("deleteConfirm.body")}
          confirmLabel={t("deleteConfirm.confirm")}
          cancelLabel={t("cancel")}
          busy={busy}
          danger
          onConfirm={() => void deleteConnection()}
          onCancel={() => setDeleting(null)}
          onDismiss={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}
