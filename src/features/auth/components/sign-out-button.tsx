"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/shared/i18n/navigation";
import { authClient } from "../auth-client";

export function SignOutButton({
  className = "",
  redirectTo = "/sign-in",
}: {
  className?: string;
  redirectTo?: string;
}) {
  const t = useTranslations("auth.signOut");
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleSignOut(): Promise<void> {
    setBusy(true);
    await authClient.signOut();
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      disabled={busy}
      className={className}
    >
      {busy ? t("busy") : t("label")}
    </button>
  );
}
