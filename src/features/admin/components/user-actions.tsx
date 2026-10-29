"use client";

import { useState } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";

export function UserActions({
  userId,
  inactive,
}: {
  userId: string;
  inactive: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const action = inactive ? "activate" : "deactivate";

  async function handleClick() {
    if (!inactive && !window.confirm("Deactivate this account? They will be signed out.")) {
      return;
    }

    setBusy(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, { method: "POST" });

      if (!response.ok) {
        setError("The change failed. Try again.");
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
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={busy}
        className={buttonClass(inactive ? "accent" : "danger", "md")}
      >
        {inactive ? "Activate account" : "Deactivate account"}
      </button>
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
