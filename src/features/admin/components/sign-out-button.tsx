"use client";

import { useState } from "react";
import { useRouter } from "@/shared/i18n/navigation";

export function AdminSignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut() {
    setBusy(true);
    await fetch("/api/admin/session", { method: "DELETE" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={busy}
      className="w-full rounded-xl px-3 py-2 text-start text-sm text-muted transition hover:bg-white/[0.06] hover:text-ink disabled:opacity-50"
    >
      {busy ? "Signing out..." : "Sign out"}
    </button>
  );
}
