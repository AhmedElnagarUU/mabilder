"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonClass } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";

export function DeleteSiteButton({ siteId }: { siteId: string }) {
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
        const result = (await response.json()) as { error?: string };
        throw new Error(result.error ?? "Could not delete the website.");
      }

      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not delete the website.",
      );
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Delete website"
        title="Delete website"
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[11px] text-muted transition-colors hover:bg-danger-soft hover:text-danger focus-visible:ring-2 focus-visible:ring-danger/20 focus-visible:outline-none"
      >
        <Icon name="trash" className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Delete</span>
      </button>
    );
  }

  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[7px] tracking-[0.06em] text-muted uppercase">
        Delete?
      </span>
      <button
        type="button"
        onClick={() => void handleDelete()}
        disabled={busy}
        className={buttonClass("danger", "sm", "h-8 px-3 text-[11px]")}
      >
        {busy ? "Deleting..." : "Confirm"}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={busy}
        className={buttonClass("ghost", "sm", "h-8 px-3 text-[11px]")}
      >
        Cancel
      </button>
      {error ? (
        <span className="text-[10px] text-danger">{error}</span>
      ) : null}
    </span>
  );
}
