import { getTranslations } from "next-intl/server";
import { Icon, type IconName } from "@/shared/ui/icon";

const industries = [
  { key: "architecture", icon: "compass" },
  { key: "interior", icon: "sofa" },
  { key: "decoration", icon: "brush" },
  { key: "engineering", icon: "beam" },
  { key: "construction", icon: "hardhat" },
  { key: "contracting", icon: "crane" },
] as const satisfies readonly { key: string; icon: IconName }[];

export async function LandingIndustries() {
  const t = await getTranslations("landing.industries");

  return (
    <section
      aria-label={t("aria")}
      className="relative z-[5] pt-[90px] sm:pt-[130px] lg:pt-[186px]"
    >
      <p className="mono-label text-center text-[9px] tracking-[0.17em] text-[#68686f]">
        {t("label")}
      </p>
      <div className="mx-auto mt-8 flex w-[min(1320px,calc(100%-40px))] flex-wrap items-center justify-center gap-x-[clamp(24px,4vw,78px)] gap-y-6 sm:w-[min(1320px,calc(100%-96px))]">
        {industries.map((industry) => (
          <span
            key={industry.key}
            className="inline-flex items-center gap-2 whitespace-nowrap text-[#d4d4d6] transition-colors hover:text-white"
          >
            <Icon
              name={industry.icon}
              className="h-[19px] w-[19px] shrink-0 text-[#a9a9ae]"
            />
            <span className="text-[15px] leading-none tracking-[-0.025em] sm:text-[16.5px]">
              {t(industry.key)}
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}
