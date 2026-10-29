"use client";

import { useState } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { inputClass, labelClass } from "@/shared/ui/field";

type Action = "extend_trial" | "grant_pro" | "end_plan";

export function PlanChangeForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [action, setAction] = useState<Action>("extend_trial");
  const [until, setUntil] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function apply() {
    if (action === "end_plan" && !window.confirm("End this user's plan now?")) {
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch(`/api/admin/users/${userId}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "end_plan" ? { action } : { action, until }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(result.error ?? "The change failed. Try again.");
        return;
      }

      router.refresh();
    } catch {
      setMessage("The change failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="block">
        <span className={labelClass}>Change plan</span>
        <select
          value={action}
          onChange={(event) => setAction(event.target.value as Action)}
          className={`${inputClass} w-auto`}
        >
          <option value="extend_trial">Extend trial until</option>
          <option value="grant_pro">Grant Pro until</option>
          <option value="end_plan">End plan now</option>
        </select>
      </label>
      {action === "end_plan" ? null : (
        <label className="block">
          <span className={labelClass}>Date</span>
          <input
            type="date"
            value={until}
            onChange={(event) => setUntil(event.target.value)}
            className={`${inputClass} w-auto`}
          />
        </label>
      )}
      <button
        type="button"
        onClick={() => void apply()}
        disabled={busy || (action !== "end_plan" && !until)}
        className={buttonClass(action === "end_plan" ? "danger" : "accent", "md")}
      >
        Apply
      </button>
      {message ? (
        <p role="alert" className="w-full text-sm text-danger">
          {message}
        </p>
      ) : null}
    </div>
  );
}
