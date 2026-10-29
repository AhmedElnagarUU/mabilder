"use client";

import { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/shared/i18n/navigation";
import { routing, type Locale } from "@/shared/i18n/routing";

type LocaleSwitcherProps = {
  className?: string;
  beforeSwitch?: () => Promise<boolean>;
};

export function LocaleSwitcher({ className = "", beforeSwitch }: LocaleSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const nextLocale: Locale =
    routing.locales.find((candidate) => candidate !== locale) ??
    routing.defaultLocale;

  async function switchLocale(): Promise<void> {
    const shouldSwitch = (await beforeSwitch?.()) ?? true;

    if (!shouldSwitch) {
      return;
    }

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <button
      type="button"
      onClick={() => void switchLocale()}
      disabled={isPending}
      aria-label={t("switchLanguage")}
      className={className}
    >
      {t("language")}
    </button>
  );
}
