"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { buttonClass } from "@/shared/ui/button";

const errorCodes = new Set([
  "unauthorized",
  "billing_unavailable",
  "no_subscription",
  "checkout_failed",
  "portal_failed",
]);

type Action = "checkout" | "portal";

export function BillingActions({ canManage }: { canManage: boolean }) {
  const t = useTranslations("billing");
  const locale = useLocale();
  const [busy, setBusy] = useState<Action | null>(null);
  const [error, setError] = useState("");

  async function open(action: Action): Promise<void> {
    setBusy(action);
    setError("");

    try {
      const response = await fetch(`/api/billing/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const result = (await response.json()) as { url?: string; code?: string };

      if (!response.ok || !result.url) {
        setError(t(`errors.${result.code && errorCodes.has(result.code) ? result.code : "default"}`));
        setBusy(null);
        return;
      }

      window.location.assign(result.url);
    } catch {
      setError(t("errors.default"));
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {canManage ? (
        <button
          type="button"
          onClick={() => void open("portal")}
          disabled={busy !== null}
          className={buttonClass("secondary", "md")}
        >
          {busy === "portal" ? t("opening") : t("manage")}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void open("checkout")}
          disabled={busy !== null}
          className={buttonClass("primary", "md")}
        >
          {busy === "checkout" ? t("opening") : t("subscribe")}
        </button>
      )}
      {error ? (
        <span role="alert" className="text-[13px] text-danger">
          {error}
        </span>
      ) : null}
    </div>
  );
}
