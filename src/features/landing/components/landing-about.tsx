import { getTranslations } from "next-intl/server";
import { Icon } from "@/shared/ui/icon";

export async function LandingAbout() {
  const t = await getTranslations("landing.about");

  return (
    <section
      id="about"
      className="relative pt-[140px] pb-[100px] sm:pt-[220px] lg:pt-[296px] lg:pb-[150px]"
    >
      <div className="mx-auto w-[min(1320px,calc(100%-40px))] sm:w-[min(1320px,calc(100%-96px))]">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.58fr)] lg:items-start lg:gap-[130px]">
          <h2 className="max-w-[780px] text-[clamp(34px,6.4vw,60px)] leading-[1.08] font-light tracking-[-0.05em] text-[#f0f0ed]">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
            <br />
            {t("titleLine3")}
            <span className="text-[#898990]">{t("titleAccent")}</span>
          </h2>

          <div className="max-w-[390px] lg:justify-self-end lg:pt-[67px]">
            <p className="text-[13.5px] leading-[1.78] text-[#85858d]">
              {t("body")}
            </p>
            <a
              href="#how"
              className="group mt-7 inline-flex items-center gap-2.5 border-b border-white/[0.16] pb-1.5 text-[11px] text-[#d8d8d6] transition-colors hover:text-white"
            >
              {t("link")}
              <Icon
                name="arrow-up"
                className="h-3 w-3 transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
              />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
