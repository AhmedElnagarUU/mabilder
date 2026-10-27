import { getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";
import { Icon } from "@/shared/ui/icon";

const stepKeys = ["brief", "pages", "shape", "share"] as const;

const metaKeys = [
  { key: "brief", label: "briefLabel", value: "briefValue" },
  { key: "draft", label: "draftLabel", value: "draftValue" },
  { key: "editor", label: "editorLabel", value: "editorValue" },
  { key: "output", label: "outputLabel", value: "outputValue" },
] as const;

const stepNumbers: Record<(typeof stepKeys)[number], string> = {
  brief: "01",
  pages: "02",
  shape: "03",
  share: "04",
};

export async function LandingSteps() {
  const t = await getTranslations("landing.steps");

  return (
    <section id="how-it-works" className="pt-32">
      <div className="mx-auto w-full max-w-[1180px] px-5">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <p className="eyebrow text-soft">{t("eyebrow")}</p>
            <h2 className="mt-6 font-display text-[clamp(46px,5.4vw,76px)] leading-[0.99] font-normal tracking-[-0.058em]">
              {t("titleLine1")}
              <br />
              <span className="text-faint">{t("titleLine2")}</span>
            </h2>
            <p className="mt-7 max-w-[430px] text-[16px] leading-[1.7] tracking-[-0.01em] text-soft">
              {t("body")}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5">
              {metaKeys.map((item) => (
                <div key={item.key}>
                  <span className="mono-label block text-[9.5px] tracking-[0.12em] text-faint">
                    {t(`meta.${item.label}`)}
                  </span>
                  <b className="mt-1.5 block text-[13.5px] font-medium tracking-[-0.01em] text-soft">
                    {t(`meta.${item.value}`)}
                  </b>
                </div>
              ))}
            </div>
          </div>

          <ol className="border-t border-line">
            {stepKeys.map((key) => (
              <li
                key={key}
                className="group flex gap-5 border-b border-line py-6 sm:gap-8"
              >
                <span className="font-mono text-[10px] font-medium tracking-[0.14em] text-faint">
                  {stepNumbers[key]}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="font-display text-[24px] font-normal tracking-[-0.04em]">
                      {t(`items.${key}.title`)}
                    </h3>
                    <span className="mono-label text-[9px] tracking-[0.1em] text-faint">
                      {t(`items.${key}.note`)}
                    </span>
                  </div>
                  <p className="mt-2 max-w-[380px] text-[13.5px] leading-[1.65] text-muted">
                    {t(`items.${key}.body`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="glass relative mt-[72px] grid overflow-hidden rounded-[30px] px-7 py-12 sm:px-14 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(600px_260px_at_80%_10%,rgba(255,255,255,0.9),transparent_70%),linear-gradient(120deg,rgba(255,255,255,0.34),rgba(255,255,255,0.04))]" />
          </div>

          <div className="relative">
            <div className="font-display text-[20px] text-faint">“</div>
            <h3 className="mt-2 max-w-[760px] font-display text-[clamp(28px,3.4vw,44px)] leading-[1.12] font-normal tracking-[-0.048em]">
              {t("quote.line1")}{" "}
              <span className="text-faint">{t("quote.line2")}</span>
            </h3>
            <p className="mt-4 max-w-[460px] text-[14px] leading-[1.65] text-muted">
              {t("quote.body")}
            </p>
          </div>

          <div className="relative mt-8 flex flex-col items-center gap-3 lg:mt-0">
            <Link
              href="/dashboard/new"
              aria-label={t("startBriefAria")}
              className="grid h-[86px] w-[86px] place-items-center rounded-full bg-accent text-white shadow-[0_24px_40px_-20px_rgba(6,91,92,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-300 hover:scale-105"
            >
              <Icon name="arrow-up" className="h-6 w-6 rtl:rotate-180" />
            </Link>
            <small className="mono-label text-[9.5px] tracking-[0.12em] text-muted">
              {t("startBrief")}
            </small>
          </div>
        </div>
      </div>
    </section>
  );
}
