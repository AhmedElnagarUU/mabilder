import { getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";
import { SectionLabel } from "./landing-section-label";

const stepKeys = ["brief", "facts", "build", "share"] as const;

export async function LandingHow() {
  const t = await getTranslations("landing.how");

  return (
    <section id="how" className="pt-[60px] lg:pt-[40px]">
      <div className="mx-auto w-[min(1320px,calc(100%-40px))] sm:w-[min(1320px,calc(100%-96px))]">
        <SectionLabel num={t("num")} label={t("label")} aside={t("aside")} />

        <div className="mt-[30px] mb-12 flex flex-col gap-6 lg:mb-[56px] lg:flex-row lg:items-end lg:justify-between lg:gap-[70px]">
          <h2 className="max-w-[850px] text-[clamp(36px,5.6vw,66px)] leading-[1.02] font-light tracking-[-0.052em] text-[#f0f0ed]">
            {t("titleLine1")}
            <br />
            <em className="text-[#88888f] not-italic">{t("titleAccent")}</em>
          </h2>
          <p className="max-w-[302px] pb-1.5 text-[12.5px] leading-[1.72] text-[#808087]">
            {t("intro")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          {stepKeys.map((key) => (
            <Reveal key={key} className="h-full">
              <article className="group relative flex h-full min-h-[230px] flex-col overflow-hidden rounded-[21px] border border-line bg-[linear-gradient(158deg,rgba(255,255,255,0.046),rgba(255,255,255,0.012)_52%,rgba(255,255,255,0.02))] p-6 transition-colors duration-300 hover:border-white/[0.16] sm:p-7">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(420px_240px_at_80%_-10%,rgba(119,214,203,0.06),transparent_70%)]"
                />
                <span className="relative text-[44px] leading-none font-light tracking-[-0.05em] text-[#f3f3f0] sm:text-[52px]">
                  {t(`steps.${key}.num`)}
                </span>
                <h3 className="relative mt-7 text-[20px] leading-[1.15] font-normal tracking-[-0.03em] text-[#efefec]">
                  {t(`steps.${key}.title`)}
                </h3>
                <p className="relative mt-2.5 text-[11.5px] leading-[1.65] text-[#8b8b92]">
                  {t(`steps.${key}.body`)}
                </p>
                <small className="mono-label relative mt-auto pt-6 text-[8px] tracking-[0.12em] text-[#6a6a71]">
                  {t(`steps.${key}.note`)}
                </small>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
