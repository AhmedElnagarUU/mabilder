"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Field } from "@/shared/ui/field";
import { authClient } from "../auth-client";
import { authErrorKey, type AuthErrorKey } from "../errors";

export function SignUpForm({ nextPath }: { nextPath: string }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<AuthErrorKey | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setErrorKey(null);

    try {
      const { error } = await authClient.signUp.email({
        name: name.trim(),
        email,
        password,
      });

      if (error) {
        setErrorKey(authErrorKey(error));
        setBusy(false);
        return;
      }

      router.replace(nextPath);
      router.refresh();
    } catch {
      setErrorKey("default");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label={t("fields.name")}
        value={name}
        onChange={setName}
        placeholder={t("placeholders.name")}
        required
      />
      <Field
        label={t("fields.email")}
        type="email"
        value={email}
        onChange={setEmail}
        placeholder={t("placeholders.email")}
        required
      />
      <Field
        label={t("fields.password")}
        type="password"
        value={password}
        onChange={setPassword}
        placeholder={t("placeholders.newPassword")}
        required
      />

      {errorKey ? (
        <p
          role="alert"
          className="rounded-2xl border border-danger/20 bg-danger-soft px-4 py-3 text-xs leading-5 text-danger"
        >
          {t(`errors.${errorKey}`)}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className={buttonClass("primary", "md", "w-full")}
      >
        {busy ? t("signUp.busy") : t("signUp.submit")}
      </button>
    </form>
  );
}
