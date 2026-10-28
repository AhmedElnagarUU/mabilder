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
      className="inline-flex items-center gap-2.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-4 focus-visible:ring-offset-canvas"
    >
      <span className="flex h-[23px] w-[23px] shrink-0 items-center justify-center">
        <svg viewBox="0 0 32 32" className="h-[23px] w-[23px]" aria-hidden>
          <defs>
            <linearGradient
              id="ws-mark-gradient"
              x1="4"
              y1="2"
              x2="28"
              y2="30"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0" stopColor="#c5fbee" />
              <stop offset="0.42" stopColor="#5eead4" />
              <stop offset="1" stopColor="#0b7f76" />
            </linearGradient>
          </defs>
          <g
            fill="url(#ws-mark-gradient)"
            stroke="url(#ws-mark-gradient)"
            strokeWidth="1.2"
            strokeLinejoin="round"
          >
            <path d="M7.1 10.1 16 2.4l8.9 7.7-4.4 4.7-4.5-4.1-4.5 4.1-4.4-4.7Z" />
            <path d="M24.9 21.9 16 29.6l-8.9-7.7 4.4-4.7 4.5 4.1 4.5-4.1 4.4 4.7Z" />
          </g>
        </svg>
      </span>
      {showName ? (
        <span className="font-display text-[17px] font-medium tracking-[-0.025em] text-ink">
          {t("appName")}
        </span>
      ) : null}
    </Link>
  );
}
