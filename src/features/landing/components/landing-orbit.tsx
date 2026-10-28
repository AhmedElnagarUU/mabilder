import { getTranslations } from "next-intl/server";

const haloTop =
  "bg-[conic-gradient(from_196deg_at_50%_50%,transparent_0deg,rgba(255,255,255,0.12)_22deg,rgba(255,255,255,0.65)_62deg,rgba(255,255,255,0.95)_88deg,rgba(255,255,255,0.45)_118deg,transparent_154deg,transparent_250deg,rgba(255,255,255,0.2)_286deg,rgba(255,255,255,0.55)_308deg,rgba(255,255,255,0.16)_332deg,transparent_350deg)]";

const haloMask =
  "[mask:radial-gradient(farthest-side,transparent_calc(100%_-_1.6px),#000_calc(100%_-_0.6px))] [-webkit-mask:radial-gradient(farthest-side,transparent_calc(100%_-_1.6px),#000_calc(100%_-_0.6px))]";

export async function LandingOrbit() {
  const t = await getTranslations("landing.orbit");

  return (
    <section
      aria-label={t("aria")}
      className="relative px-5 pt-[90px] sm:pt-[116px]"
    >
      <div className="relative mx-auto grid aspect-square w-[min(724px,calc(100vw-40px))] place-items-center">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full border border-white/15 shadow-[inset_0_0_100px_rgba(255,255,255,0.022),0_0_140px_rgba(126,134,172,0.035)]"
        />
        <div
          aria-hidden
          className={`absolute -inset-px rounded-full opacity-95 [filter:drop-shadow(0_0_9px_rgba(255,255,255,0.22))] ${haloTop} ${haloMask}`}
        />
        <div
          aria-hidden
          className={`absolute inset-[9px] rounded-full bg-[conic-gradient(from_208deg,transparent_0deg,rgba(255,255,255,0.18)_70deg,transparent_130deg,transparent_320deg,rgba(255,255,255,0.12)_342deg,transparent_360deg)] opacity-55 blur-[1.5px] ${haloMask}`}
        />

        <p className="relative z-[2] max-w-[80%] text-center text-[clamp(18px,4.4vw,37px)] leading-[1.22] font-light tracking-[-0.037em] text-[#e9e9e6] text-balance sm:max-w-[574px]">
          {t("copy")}
        </p>

        <span className="mono-label absolute inset-x-0 top-0 mx-auto inline-flex h-7 w-fit -translate-y-1/2 items-center rounded-full bg-[#f4f4f1] px-3.5 text-[8px] tracking-[0.115em] text-[#0b0b0d] shadow-[0_0_26px_rgba(255,255,255,0.19),0_4px_16px_rgba(0,0,0,0.4)] sm:text-[9px]">
          {t("aiWritten")}
        </span>
        <span className="mono-label absolute start-[11.5%] top-[81%] inline-flex h-7 -translate-y-1/2 items-center rounded-full bg-[#f4f4f1] px-3.5 text-[8px] tracking-[0.115em] text-[#0b0b0d] shadow-[0_0_26px_rgba(255,255,255,0.19),0_4px_16px_rgba(0,0,0,0.4)] sm:text-[9px]">
          {t("factsOnly")}
        </span>
        <span className="mono-label absolute end-[11.5%] top-[81%] inline-flex h-7 -translate-y-1/2 items-center rounded-full bg-[#f4f4f1] px-3.5 text-[8px] tracking-[0.115em] text-[#0b0b0d] shadow-[0_0_26px_rgba(255,255,255,0.19),0_4px_16px_rgba(0,0,0,0.4)] sm:text-[9px]">
          {t("languages")}
        </span>

        <span
          aria-hidden
          className="absolute start-[8.1%] top-[19%] h-[9px] w-[9px] rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.65),0_0_2px_#fff]"
        >
          <i className="absolute inset-[3px] rounded-full bg-[#0a0a0c]" />
        </span>
        <span
          aria-hidden
          className="absolute end-[8.1%] top-[19%] h-[9px] w-[9px] rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.65),0_0_2px_#fff]"
        >
          <i className="absolute inset-[3px] rounded-full bg-[#0a0a0c]" />
        </span>
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 mx-auto h-[9px] w-[9px] -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.65),0_0_2px_#fff]"
        >
          <i className="absolute inset-[3px] rounded-full bg-[#0a0a0c]" />
        </span>
      </div>
    </section>
  );
}
