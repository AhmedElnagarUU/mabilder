"use client";

import { useState } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { inputClass } from "@/shared/ui/field";

type Decision = "approve" | "reject";

export function PaymentActions({ paymentId }: { paymentId: string }) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function decide(decision: Decision) {
    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/payments/${paymentId}/${decision}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(note.trim() ? { note: note.trim() } : {}),
      });

      if (!response.ok) {
        const result = (await response.json()) as { error?: string };
        setError(result.error ?? "The change failed. Try again.");
        return;
      }

      router.refresh();
    } catch {
      setError("The change failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-56 flex-col gap-2">
      <input
        type="text"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        maxLength={500}
        placeholder="Note (optional)"
        aria-label="Note"
        className={inputClass}
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={() => void decide("approve")}
          className={buttonClass("accent", "sm")}
        >
          Approve
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void decide("reject")}
          className={buttonClass("danger", "sm")}
        >
          Reject
        </button>
      </div>
      {error ? (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
