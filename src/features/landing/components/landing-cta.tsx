import { getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { Reveal } from "./reveal";
import { SectionLabel } from "./landing-section-label";

export async function LandingCta() {
  const t = await getTranslations("landing.cta");

  return (
    <section id="contact" className="pb-[30px]">
      <div className="mx-auto w-[min(1320px,calc(100%-40px))] sm:w-[min(1320px,calc(100%-96px))]">
        <div className="relative overflow-hidden rounded-[26px] border border-line bg-[radial-gradient(700px_350px_at_50%_110%,rgba(74,143,134,0.15),transparent_70%),radial-gradient(900px_440px_at_50%_-25%,rgba(126,113,176,0.12),transparent_70%),linear-gradient(155deg,#0b0b0e,#070708_70%)] px-6 py-16 text-center sm:px-14 sm:py-20 lg:py-[98px]">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-[-800px] mx-auto h-[1120px] w-[1120px] rounded-full border border-white/[0.09] shadow-[inset_0_0_80px_rgba(255,255,255,0.03)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-[-640px] mx-auto h-[840px] w-[840px] rounded-full border border-white/[0.08]"
          />

          <Reveal>
            <div className="relative z-[1]">
              <SectionLabel label={t("label")} aside={t("aside")} center />

              <h2 className="mx-auto mt-6 max-w-[850px] text-[clamp(40px,5.2vw,80px)] leading-[0.99] font-light tracking-[-0.058em] text-[#f3f3f0] text-balance">
                {t("titleLine1")}
                <br />
                <em className="text-[#8f8f95] not-italic">
                  {t("titleAccent")}
                </em>
              </h2>

              <p className="mx-auto mt-6 max-w-[430px] text-[13px] leading-[1.7] text-[#8b8b92]">
                {t("body")}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <Link
                  href="/dashboard"
                  className={buttonClass("inverse", "lg", "gap-2.5")}
                >
                  {t("button")}
                  <Icon
                    name="arrow"
                    className="h-[15px] w-[15px] rtl:rotate-180"
                  />
                </Link>
                <a href="#how" className={buttonClass("secondary", "lg")}>
                  {t("secondary")}
                </a>
              </div>

              <p className="mono-label mt-4 text-[8px] tracking-[0.1em] text-[#63636b]">
                {t("note")}
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
