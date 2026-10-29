import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/shared/i18n/locale-switcher";
import { Logo } from "@/shared/ui/logo";
import { LandingAccountActions } from "./landing-account-actions";
import { LandingMobileMenu } from "./landing-mobile-menu";
import { landingNavLinks } from "./landing-nav-links";

export async function LandingHeader() {
  const t = await getTranslations("landing.nav");

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <nav
        aria-label={t("main")}
        className="relative mx-auto flex h-[70px] w-[min(1400px,calc(100%-32px))] items-center justify-between gap-5 lg:grid lg:h-[82px] lg:w-[min(1400px,calc(100%-84px))] lg:grid-cols-[1fr_auto_1fr] lg:gap-6"
      >
        <Logo />

        <div className="hidden items-center gap-0.5 rounded-full border border-white/[0.075] bg-[rgba(16,16,19,0.55)] p-[5px] shadow-[0_10px_40px_rgba(0,0,0,0.35)] backdrop-blur-[22px] backdrop-saturate-120 lg:flex">
          {landingNavLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              className={
                link.key === "home"
                  ? "inline-flex h-[34px] items-center rounded-full bg-[#f0f0ec] px-4 text-[11.5px] font-medium text-[#09090b]"
                  : "inline-flex h-[34px] items-center rounded-full px-4 text-[11.5px] text-[#a2a2a9] transition-colors hover:text-[#efefec]"
              }
            >
              {t(link.key)}
            </a>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3.5">
          <LocaleSwitcher className="hidden h-[34px] items-center rounded-full border border-white/10 px-3.5 text-[11.5px] text-[#b9b9c0] transition-colors hover:border-white/20 hover:text-white sm:inline-flex" />
          <LandingAccountActions variant="header" />
          <LandingMobileMenu />
        </div>
      </nav>
    </header>
  );
}
