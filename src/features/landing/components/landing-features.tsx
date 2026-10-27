import { getTranslations } from "next-intl/server";
import { Icon } from "@/shared/ui/icon";

const pageKeys = [
  "home",
  "studio",
  "services",
  "work",
  "profile",
  "contact",
] as const;

const groundKeys = ["facts", "draft", "review", "output"] as const;

const groundNumbers: Record<(typeof groundKeys)[number], string> = {
  facts: "01",
  draft: "02",
  review: "03",
  output: "04",
};

export async function LandingFeatures() {
  const t = await getTranslations("landing");

  return (
    <section id="capabilities" className="pt-[140px]">
      <div className="mx-auto w-full max-w-[1180px] px-5">
        <div className="mb-[42px] flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div>
            <p className="eyebrow">{t("features.eyebrow")}</p>
            <h2 className="mt-5 font-display text-[clamp(38px,4.4vw,60px)] leading-[1.01] font-normal tracking-[-0.055em]">
              {t("features.titleLine1")}
              <br />
              <span className="text-faint">{t("features.titleLine2")}</span>
            </h2>
          </div>
          <p className="max-w-[330px] text-[13px] leading-[1.65] text-muted">
            {t("features.intro")}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <article className="glass relative flex min-h-[280px] flex-col overflow-hidden rounded-[22px] p-7 lg:col-span-7">
            <div className="mb-9 flex items-center justify-between">
              <span className="mono-label text-[8.5px] tracking-[0.1em] text-faint">
                {t("features.write.eyebrow")}
              </span>
              <Icon name="pen" className="h-4 w-4 text-faint" />
            </div>
            <h3 className="font-display text-[22px] leading-[1.1] font-normal tracking-[-0.04em]">
              {t("features.write.titleLine1")}
              <br />
              {t("features.write.titleLine2")}
            </h3>
            <p className="mt-2.5 max-w-[380px] text-xs leading-[1.6] text-muted">
              {t("features.write.body")}
            </p>

            <div className="mt-auto pt-7">
              <div className="rounded-xl border border-ink/5 bg-white p-4 shadow-soft">
                <div className="mb-2.5 flex items-center gap-1.5">
                  <i className="h-[5px] w-[5px] rounded-full bg-[#b4ece6]" />
                  <i className="h-[5px] w-[5px] rounded-full bg-[#b4ece6]" />
                  <i className="h-[5px] w-[5px] rounded-full bg-[#b4ece6]" />
                  <span className="ms-auto font-mono text-[6.5px] tracking-[0.08em] text-faint">
                    {t("features.write.mockNote")}
                  </span>
                </div>
                <h4 className="font-display text-base font-medium leading-[1.2] tracking-[-0.035em]">
                  {t("features.write.mockTitle")}
                </h4>
                <p className="mt-1.5 max-w-[420px] text-[9px] leading-[1.55] text-muted">
                  {t("features.write.mockBody")}
                </p>
                <div className="mt-3 flex flex-col gap-[5px]">
                  <i className="h-1 w-[88%] rounded-sm bg-[#eef8f6]" />
                  <i className="h-1 w-[72%] rounded-sm bg-[#eef8f6]" />
                  <i className="h-1 w-[48%] rounded-sm bg-[#eef8f6]" />
                </div>
              </div>
            </div>
          </article>

          <article className="relative flex min-h-[280px] flex-col overflow-hidden rounded-[22px] border border-white/12 bg-[linear-gradient(160deg,#0a5b5c,#032b2e_62%)] p-7 text-white shadow-[0_40px_100px_-40px_rgba(2,38,41,0.5),0_12px_32px_-18px_rgba(2,48,51,0.24)] lg:col-span-5">
            <div className="mb-9 flex items-center justify-between">
              <span className="mono-label text-[8.5px] tracking-[0.1em] text-white/40">
                {t("features.ground.eyebrow")}
              </span>
              <Icon name="shield" className="h-4 w-4 text-white/40" />
            </div>
            <h3 className="font-display text-[22px] leading-[1.1] font-normal tracking-[-0.04em]">
              {t("features.ground.titleLine1")}
              <br />
              {t("features.ground.titleLine2")}
            </h3>
            <p className="mt-2.5 max-w-[300px] text-xs leading-[1.6] text-white/48">
              {t("features.ground.body")}
            </p>

            <div className="mt-auto pt-6">
              {groundKeys.map((key, index) => (
                <div key={key}>
                  {index > 0 ? (
                    <div className="ms-[11px] h-2.5 w-px bg-white/15" />
                  ) : null}
                  <div className="flex items-center gap-2.5 py-1.5">
                    <i
                      className={`grid h-[22px] w-[22px] place-items-center rounded-full border font-mono text-[7px] ${
                        index === 0
                          ? "border-white bg-white text-ink"
                          : "border-white/20 text-white/60"
                      }`}
                    >
                      {groundNumbers[key]}
                    </i>
                    <b
                      className={`text-[10px] font-normal tracking-[-0.01em] ${
                        index === 0 ? "text-white" : "text-white/54"
                      }`}
                    >
                      {t(`features.ground.steps.${key}.label`)}
                    </b>
                    <span className="ms-auto font-mono text-[7px] text-white/32">
                      {t(`features.ground.steps.${key}.note`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="glass relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[22px] p-7 lg:col-span-5">
            <div className="flex items-center justify-between">
              <span className="mono-label text-[8.5px] tracking-[0.1em] text-faint">
                {t("features.complete.eyebrow")}
              </span>
              <Icon name="pages" className="h-4 w-4 text-faint" />
            </div>
            <div>
              <div className="font-display text-[clamp(52px,5vw,72px)] leading-[0.9] font-light tracking-[-0.07em]">
                {t("features.complete.value")}
                <span className="ms-1 align-top text-[0.38em] font-normal tracking-[-0.02em] text-muted">
                  {t("features.complete.unit")}
                </span>
              </div>
              <div className="mono-label mt-2.5 text-[7.5px] tracking-[0.08em] text-faint">
                {t("features.complete.note")}
              </div>
            </div>
            <p className="mt-5 max-w-[280px] text-xs leading-[1.6] text-muted">
              {t("features.complete.body")}
            </p>
          </article>

          <article className="glass relative flex min-h-[250px] flex-col overflow-hidden rounded-[22px] p-7 lg:col-span-7">
            <div className="mb-9 flex items-center justify-between">
              <span className="mono-label text-[8.5px] tracking-[0.1em] text-faint">
                {t("features.shape.eyebrow")}
              </span>
              <Icon name="monitor" className="h-4 w-4 text-faint" />
            </div>
            <h3 className="font-display text-[22px] leading-[1.1] font-normal tracking-[-0.04em]">
              {t("features.shape.titleLine1")}
              <br />
              {t("features.shape.titleLine2")}
            </h3>
            <p className="mt-2.5 max-w-[360px] text-xs leading-[1.6] text-muted">
              {t("features.shape.body")}
            </p>

            <div className="mt-auto grid grid-cols-2 gap-2 pt-6 sm:grid-cols-3">
              {pageKeys.map((key) => (
                <span
                  key={key}
                  className="flex items-center gap-2 rounded-full border border-line bg-white/60 px-3 py-2 text-[10px] text-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                >
                  <i className="h-[3px] w-[3px] rounded-full bg-ink" />
                  {t(`pages.${key}`)}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
