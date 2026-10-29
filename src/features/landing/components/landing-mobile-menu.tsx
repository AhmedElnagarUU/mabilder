"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/shared/i18n/locale-switcher";
import { Icon } from "@/shared/ui/icon";
import { LandingAccountActions } from "./landing-account-actions";
import { landingNavLinks } from "./landing-nav-links";

export function LandingMobileMenu() {
  const t = useTranslations("landing.nav");
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-controls="landing-mobile-menu"
        aria-label={open ? t("closeMenu") : t("openMenu")}
        className="grid h-10 w-10 place-items-center rounded-full border border-line text-[#d5d5d3] transition-colors hover:border-white/20 hover:text-white lg:hidden"
      >
        <Icon name="menu" className="h-[17px] w-[17px]" />
      </button>

      {open ? (
        <div
          id="landing-mobile-menu"
          className="absolute inset-x-0 top-[calc(100%+10px)] z-50 rounded-[18px] border border-white/[0.11] bg-[rgba(13,13,16,0.92)] p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.55)] backdrop-blur-[24px] backdrop-saturate-120 lg:hidden"
        >
          <nav aria-label={t("main")} className="grid">
            {landingNavLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-[11px] px-3.5 py-3 text-[13px] text-[#c9c9c6] transition-colors hover:bg-white/[0.055] hover:text-white"
              >
                {t(link.key)}
              </a>
            ))}
            <LocaleSwitcher className="flex items-center justify-between rounded-[11px] px-3.5 py-3 text-start text-[13px] text-[#c9c9c6] transition-colors hover:bg-white/[0.055] hover:text-white" />
            <LandingAccountActions
              variant="menu"
              onNavigate={() => setOpen(false)}
            />
          </nav>
        </div>
      ) : null}
    </>
  );
}
