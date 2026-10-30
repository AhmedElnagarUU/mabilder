"use client";

import { useTranslations } from "next-intl";
import { Icon } from "../../../shared/ui/icon";

type CreditBadgeProps = {
  left: number | null;
};

export function CreditBadge({ left }: CreditBadgeProps) {
  const t = useTranslations("credits");

  if (left === null) {
    return null;
  }

  return (
    <span
      title={t("hint")}
      className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-2.5 text-sm text-soft"
    >
      <Icon name="spark" className="h-4 w-4 text-accent" />
      <span className="max-sm:hidden">{t("badge", { left })}</span>
      <span className="sm:hidden" aria-label={t("badge", { left })}>
        {left}
      </span>
    </span>
  );
}
