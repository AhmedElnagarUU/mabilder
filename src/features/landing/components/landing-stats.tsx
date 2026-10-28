import { getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";

const stats = [
  { value: "trial", label: "trialLabel" },
  { value: "languages", label: "languagesLabel" },
  { value: "sections", label: "sectionsLabel" },
  { value: "invented", label: "inventedLabel" },
] as const;

export async function LandingStats() {
  const t = await getTranslations("landing.stats");

  return (
    <section aria-label={t("aria")} className="border-y border-line">
      <div className="mx-auto w-[min(1320px,calc(100%-40px))] sm:w-[min(1320px,calc(100%-96px))]">
        <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-4">
          {stats.map((stat) => (
            <Reveal key={stat.value} className="bg-canvas">
              <div className="px-6 py-10 md:px-9 md:py-12">
                <b className="block text-[clamp(34px,3.7vw,54px)] leading-none font-light tracking-[-0.055em] text-[#f0f0ed]">
                  {t(stat.value)}
                </b>
                <span className="mono-label mt-3 block text-[8.5px] tracking-[0.13em] text-[#6f6f77]">
                  {t(stat.label)}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
