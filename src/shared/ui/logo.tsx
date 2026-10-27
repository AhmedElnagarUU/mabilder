"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/shared/i18n/navigation";

export function Logo({
  href = "/",
  showName = true,
}: {
  href?: string;
  showName?: boolean;
}) {
  const t = useTranslations("common");

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
    >
      <span className="flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[linear-gradient(145deg,#16a39c,#065b5c)] text-white shadow-[0_8px_16px_-10px_rgba(2,40,42,0.7),inset_0_1px_0_rgba(255,255,255,0.28)]">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-3.5 w-3.5"
          aria-hidden
        >
          <path d="M12 2c.45 5.4 3.15 8.1 8.55 8.55C15.15 11 12.45 13.7 12 19.1 11.55 13.7 8.85 11 3.45 10.55 8.85 10.1 11.55 7.4 12 2Z" />
        </svg>
      </span>
      {showName ? (
        <span className="font-display text-[17px] font-medium tracking-[-0.045em] text-ink">
          {t("appName")}
        </span>
      ) : null}
    </Link>
  );
}
