"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import { routing, type Locale } from "@/shared/i18n/routing";

export function LocaleSwitcher({ className = "" }: { className?: string }) {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextLocale: Locale =
    routing.locales.find((candidate) => candidate !== locale) ??
    routing.defaultLocale;

  function switchLocale(): void {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      disabled={isPending}
      aria-label={t("switchLanguage")}
      className={className}
    >
      {t("language")}
    </button>
  );
}
