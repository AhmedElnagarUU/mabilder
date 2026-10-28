import { getTranslations } from "next-intl/server";
import { Reveal } from "./reveal";

export async function LandingPrinciple() {
  const t = await getTranslations("landing.principle");
  const common = await getTranslations("common");

  return (
    <section
      id="principle"
      className="relative overflow-hidden py-[100px] text-center lg:py-[154px]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-[300px] w-[min(760px,100%)] -translate-y-1/2 bg-[radial-gradient(ellipse,rgba(116,160,153,0.07),transparent_68%)] blur-[30px]"
      />

      <p className="mono-label text-[10px] tracking-[0.18em] text-[#5d5d64]">
        {t("mark")}
      </p>

      <Reveal>
        <blockquote className="relative z-[1] mx-auto mt-7 max-w-[1040px] px-5 text-[clamp(28px,3.25vw,47px)] leading-[1.2] font-light tracking-[-0.042em] text-[#ededeb] text-balance sm:px-0">
          {t.rich("quote", {
            em: (chunks) => (
              <em className="text-[#8f8f96] not-italic">{chunks}</em>
            ),
          })}
        </blockquote>
      </Reveal>

      <div className="mt-9 inline-flex items-center gap-3 text-start">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.14] bg-[linear-gradient(145deg,#38413f,#131817)] text-[9px] tracking-[0.02em] text-[#d9e2df]">
          {t("avatar")}
        </span>
        <div>
          <b className="block text-[11.5px] font-medium text-[#dededb]">
            {common("appName")}
          </b>
          <small className="mt-0.5 block text-[10px] text-[#74747c]">
            {t("label")}
          </small>
        </div>
      </div>
    </section>
  );
}
