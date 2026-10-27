"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";

const errorCodes = new Set([
  "invalid_request",
  "site_not_found",
  "database_unavailable",
  "create_failed",
  "load_failed",
  "delete_failed",
  "save_failed",
  "generation_failed",
]);

function errorCodeFrom(code: string | undefined): string {
  return code && errorCodes.has(code) ? code : "default";
}

export function DeleteSiteButton({ siteId }: { siteId: string }) {
  const t = useTranslations("siteCreation.delete");
  const errors = useTranslations("dashboard.errors");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete(): Promise<void> {
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/sites/${siteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const result = (await response.json()) as { code?: string };
        setError(errors(errorCodeFrom(result.code)));
        setBusy(false);
        return;
      }

      router.refresh();
    } catch {
      setError(errors("default"));
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={t("aria")}
        title={t("aria")}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[11px] text-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:ring-2 focus-visible:ring-danger/20 focus-visible:outline-none"
      >
        <Icon name="trash" className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{t("label")}</span>
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[7px] tracking-[0.06em] text-muted uppercase">
        {t("question")}
      </span>
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={busy}
        className={buttonClass("danger", "sm", "h-8 px-3 text-[11px]")}
      >
        {busy ? t("deleting") : t("confirm")}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={busy}
        className={buttonClass("ghost", "sm", "h-8 px-3 text-[11px]")}
      >
        {t("cancel")}
      </button>
      {error ? (
        <span className="text-[10px] text-danger">{error}</span>
      ) : null}
    </span>
  );
}
