"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        setError(body.error ?? "Sign-in failed.");
        setBusy(false);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Sign-in failed. Try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Email" type="email" value={email} onChange={setEmail} required />
      <Field label="Password" type="password" value={password} onChange={setPassword} required />

      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm leading-6 text-danger"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className={buttonClass("primary", "md", "w-full")}>
        {busy ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
