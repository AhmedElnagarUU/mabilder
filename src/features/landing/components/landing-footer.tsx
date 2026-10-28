import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/shared/i18n/locale-switcher";
import { Link } from "@/shared/i18n/navigation";
import { Logo } from "@/shared/ui/logo";

const productLinks = [
  { key: "howItWorks", href: "#how" },
  { key: "capabilities", href: "#capabilities" },
  { key: "languages", href: "#languages" },
  { key: "principle", href: "#principle" },
] as const;

export async function LandingFooter() {
  const t = await getTranslations("landing.footer");

  return (
    <footer className="pb-[26px]">
      <div className="mx-auto w-[min(1320px,calc(100%-40px))] sm:w-[min(1320px,calc(100%-96px))]">
        <div className="grid gap-10 border-t border-line py-14 md:grid-cols-[1.6fr_0.72fr_0.72fr] md:gap-11 md:py-[66px]">
          <div>
            <Logo />
            <p className="mt-4 max-w-[260px] text-[11px] leading-[1.8] text-[#7d7d84]">
              {t("tagline")}
            </p>
          </div>

          <div>
            <h4 className="mono-label mb-4 text-[8px] tracking-[0.15em] font-normal text-[#5f5f67]">
              {t("product")}
            </h4>
            <div className="grid gap-2.5">
              {productLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  className="text-[10.5px] text-[#96969d] transition-colors hover:text-[#f0f0ed]"
                >
                  {t(link.key)}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mono-label mb-4 text-[8px] tracking-[0.15em] font-normal text-[#5f5f67]">
              {t("account")}
            </h4>
            <div className="grid gap-2.5">
              <Link
                href="/dashboard"
                className="text-[10.5px] text-[#96969d] transition-colors hover:text-[#f0f0ed]"
              >
                {t("dashboard")}
              </Link>
              <Link
                href="/dashboard"
                className="text-[10.5px] text-[#96969d] transition-colors hover:text-[#f0f0ed]"
              >
                {t("startTrial")}
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-3 border-t border-line-soft pt-5 text-[9px] text-[#62626a] sm:flex-row sm:items-center">
          <span>{t("copyright")}</span>
          <nav aria-label={t("legalAria")}>
            <LocaleSwitcher className="text-[9px] text-[#96969d] transition-colors hover:text-[#b5b5bb]" />
          </nav>
        </div>
      </div>
    </footer>
  );
}
