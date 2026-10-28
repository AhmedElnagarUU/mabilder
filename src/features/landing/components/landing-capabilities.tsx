import { getTranslations } from "next-intl/server";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Reveal } from "./reveal";
import { SectionLabel } from "./landing-section-label";

const cardClass =
  "group relative flex h-full flex-col overflow-hidden rounded-[21px] border border-line bg-[linear-gradient(158deg,rgba(255,255,255,0.046),rgba(255,255,255,0.012)_52%,rgba(255,255,255,0.02))] p-6 transition-colors duration-300 hover:border-white/[0.16] sm:p-7";

const glowClass =
  "pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(420px_240px_at_80%_-10%,rgba(119,214,203,0.06),transparent_70%)]";

const briefChips = ["chipOne", "chipTwo", "chipThree", "chipFour"] as const;

const sectionSteps = [
  { key: "introduction", num: "01", icon: "eye", done: true },
  { key: "projects", num: "02", icon: "eye", done: true },
  { key: "team", num: "03", icon: "eye-off", done: false },
  { key: "contact", num: "04", icon: "eye", done: true },
] as const satisfies readonly {
  key: string;
  num: string;
  icon: IconName;
  done: boolean;
}[];

const ringLegend = [
  { key: "withContent", value: "withContentValue", dot: "bg-accent" },
  { key: "skipped", value: "skippedValue", dot: "bg-[#45504e]" },
  { key: "invented", value: "inventedValue", dot: "bg-[#8fc8bd]" },
] as const;

function CardTop({
  icon,
  tag,
  index,
}: {
  icon: IconName;
  tag: string;
  index: string;
}) {
  return (
    <div className="relative flex items-center justify-between gap-4">
      <span className="mono-label inline-flex items-center gap-2 text-[8.5px] tracking-[0.13em] text-[#82828a]">
        <Icon name={icon} className="h-[13px] w-[13px] text-[#bdbdc2]" />
        {tag}
      </span>
      <span className="mono-label text-[8.5px] tracking-[0.1em] text-[#57575e]">
        {index}
      </span>
    </div>
  );
}

export async function LandingCapabilities() {
  const t = await getTranslations("landing.capabilities");

  return (
    <section
      id="capabilities"
      className="pt-[90px] pb-[70px] sm:pt-[120px] lg:pb-[100px]"
    >
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

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
          <Reveal className="h-full min-w-0 sm:col-span-2 lg:col-span-7">
            <article className={`${cardClass} min-h-[380px] lg:min-h-[424px]`}>
              <div aria-hidden className={glowClass} />
              <CardTop
                icon="spark"
                tag={t("writing.tag")}
                index={t("writing.index")}
              />
              <h3 className="relative mt-8 max-w-[420px] text-[clamp(21px,2.4vw,25px)] leading-[1.1] font-normal tracking-[-0.035em] text-[#efefec]">
                {t("writing.title")}
              </h3>
              <p className="relative mt-2.5 max-w-[390px] text-[12px] leading-[1.7] text-[#8b8b92]">
                {t("writing.body")}
              </p>

              <div className="relative mt-auto pt-7">
                <div className="grid grid-cols-1 gap-3 rounded-[13px] border border-line-soft bg-black/20 p-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.1fr)] sm:items-center sm:gap-4">
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    <small className="mono-label w-full text-[7px] tracking-[0.1em] text-[#6a6a71]">
                      {t("writing.briefLabel")}
                    </small>
                    {briefChips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full border border-line bg-white/[0.03] px-2 py-1 text-[8.5px] text-[#b9b9c0]"
                      >
                        {t(`writing.${chip}`)}
                      </span>
                    ))}
                  </div>

                  <Icon
                    name="arrow"
                    className="mx-auto h-4 w-4 rotate-90 text-[#5e7b75] rtl:rotate-90 sm:rotate-0 sm:rtl:rotate-180"
                  />

                  <div className="min-w-0 rounded-lg border border-line-soft bg-white/[0.02] p-3">
                    <small className="mono-label text-[7px] tracking-[0.1em] text-[#6a6a71]">
                      {t("writing.pageLabel")}
                    </small>
                    <b className="mt-2 block text-[12px] leading-[1.2] font-normal tracking-[-0.02em] text-[#efefec]">
                      {t("writing.pageTitle")}
                    </b>
                    <p className="mt-1.5 text-[8.5px] leading-[1.55] text-[#8b8b92]">
                      {t("writing.pageBody")}
                    </p>
                    <span className="mono-label mt-2 inline-flex items-center gap-1.5 rounded-full border border-accent/[0.16] bg-accent/[0.06] px-2 py-1 text-[7px] tracking-[0.08em] text-[#8fc0b6]">
                      <b className="font-mono text-[9px]">
                        {t("writing.statValue")}
                      </b>
                      {t("writing.statLabel")}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2.5 rounded-[11px] border border-accent/[0.12] bg-accent/[0.045] px-3 py-2.5 text-[10.5px] text-[#b9c4c1]">
                  <Icon
                    name="check"
                    className="h-[13px] w-[13px] shrink-0 text-accent"
                  />
                  <p>
                    <strong className="font-medium text-[#e2eeeb]">
                      {t("writing.insightStrong")}
                    </strong>{" "}
                    {t("writing.insightText")}
                  </p>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal className="h-full min-w-0 sm:col-span-2 lg:col-span-5">
            <article className={`${cardClass} min-h-[380px] lg:min-h-[424px]`}>
              <div aria-hidden className={glowClass} />
              <CardTop
                icon="image"
                tag={t("projects.tag")}
                index={t("projects.index")}
              />
              <h3 className="relative mt-8 text-[clamp(21px,2.4vw,25px)] leading-[1.1] font-normal tracking-[-0.035em] text-[#efefec]">
                {t("projects.title")}
              </h3>
              <p className="relative mt-2.5 max-w-[390px] text-[12px] leading-[1.7] text-[#8b8b92]">
                {t("projects.body")}
              </p>

              <div className="relative mt-auto pt-7">
                <div className="relative mx-auto mb-2 grid h-[188px] w-full max-w-[360px] place-items-center [perspective:800px]">
                  <div className="relative h-[178px] w-[296px] max-w-full overflow-hidden rounded-[16px] border border-white/15 bg-[linear-gradient(120deg,#0b1012,#080b0d_60%,#050708)] shadow-[0_26px_60px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.18)] [transform:rotateX(17deg)_rotateZ(-11deg)_rotateY(-7deg)] [transform-style:preserve-3d]">
                    <i
                      aria-hidden
                      className="absolute inset-0 bg-[radial-gradient(70%_100%_at_20%_0%,rgba(127,162,168,0.18),transparent_55%),radial-gradient(50%_80%_at_85%_100%,rgba(45,212,191,0.12),transparent_70%)]"
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(125deg,#2b3a3d_0%,#111a1c_45%,#0c2a27_100%)] opacity-70"
                    />
                    <span className="mono-label absolute end-2.5 top-2.5 rounded-full bg-[#f4f4f1] px-2 py-0.5 text-[6.5px] tracking-[0.1em] text-[#08080a]">
                      {t("projects.featured")}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3">
                      <b className="block text-[11px] font-medium text-white/90">
                        {t("projects.projectName")}
                      </b>
                      <small className="block text-[8px] text-white/45">
                        {t("projects.projectMeta")}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-line-soft pt-3 text-[10px] text-[#818188]">
                  <span>{t("projects.pageLabel")}</span>
                  <strong className="font-medium text-[#dbdbd8]">
                    {t("projects.pageNote")}
                  </strong>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal className="h-full min-w-0 lg:col-span-4">
            <article id="languages" className={cardClass}>
              <div aria-hidden className={glowClass} />
              <CardTop
                icon="globe"
                tag={t("languages.tag")}
                index={t("languages.index")}
              />
              <h3 className="relative mt-8 text-[clamp(21px,2.4vw,25px)] leading-[1.1] font-normal tracking-[-0.035em] text-[#efefec]">
                {t("languages.title")}
              </h3>

              <div className="relative mt-auto pt-7">
                <div className="grid gap-0.5">
                  <div className="flex items-center gap-2.5 border-b border-white/[0.05] py-2.5">
                    <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.035] font-mono text-[8px] text-[#bfbfc4]">
                      {t("languages.tagEn")}
                    </span>
                    <div className="min-w-0">
                      <b className="block text-[10.5px] font-medium text-[#dededb]">
                        {t("languages.home")}
                      </b>
                      <small className="mt-0.5 block text-[8.5px] text-[#6f6f77]">
                        {t("languages.ltr")}
                      </small>
                    </div>
                    <span
                      dir="ltr"
                      className="ms-auto text-end font-mono text-[9.5px] text-[#c9c9cb]"
                    >
                      {t("languages.indexFile")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 border-b border-white/[0.05] py-2.5">
                    <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.035] font-mono text-[8px] text-[#bfbfc4]">
                      {t("languages.tagAr")}
                    </span>
                    <div className="min-w-0">
                      <b
                        lang="ar"
                        dir="rtl"
                        className="block text-[10.5px] font-medium text-[#dededb]"
                      >
                        {t("languages.homeAr")}
                      </b>
                      <small className="mt-0.5 block text-[8.5px] text-[#6f6f77]">
                        {t("languages.rtl")}
                      </small>
                    </div>
                    <span
                      dir="ltr"
                      className="ms-auto text-end font-mono text-[9.5px] text-[#c9c9cb]"
                    >
                      {t("languages.arabicFile")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 py-2.5">
                    <span className="grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.035] font-mono text-[9px] text-[#bfbfc4]">
                      {t("languages.switch")}
                    </span>
                    <div className="min-w-0">
                      <b className="block text-[10.5px] font-medium text-[#dededb]">
                        {t("languages.switchTitle")}
                      </b>
                      <small className="mt-0.5 block text-[8.5px] text-[#6f6f77]">
                        {t("languages.switchNote")}
                      </small>
                    </div>
                    <span className="ms-auto text-end font-mono text-[9.5px] text-[#c9c9cb]">
                      {t("languages.everyPage")}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-[9px] text-[#73737b]">
                  <span>{t("languages.foot")}</span>
                  <b className="font-medium text-[#a9d8cf]">
                    {t("languages.ready")}
                  </b>
                </div>
              </div>
            </article>
          </Reveal>

          <Reveal className="h-full min-w-0 lg:col-span-4">
            <article className={cardClass}>
              <div aria-hidden className={glowClass} />
              <CardTop
                icon="layers"
                tag={t("sections.tag")}
                index={t("sections.index")}
              />
              <h3 className="relative mt-8 text-[clamp(21px,2.4vw,25px)] leading-[1.1] font-normal tracking-[-0.035em] text-[#efefec]">
                {t("sections.title")}
              </h3>

              <div className="relative mt-auto pt-7">
                <div className="grid gap-2">
                  {sectionSteps.map((step, index) => (
                    <div key={step.key}>
                      {index > 0 ? (
                        <span
                          aria-hidden
                          className="mb-2 ms-[11px] block h-3.5 w-px bg-[linear-gradient(rgba(255,255,255,0.2),transparent)]"
                        />
                      ) : null}
                      <div className="flex items-center gap-2.5 text-[10px] text-[#9a9aa1]">
                        <i
                          className={`grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border font-mono text-[7px] ${
                            step.done
                              ? "border-accent/30 bg-accent/[0.07] text-accent"
                              : "border-white/[0.12] bg-white/[0.025] text-[#8f8f96]"
                          }`}
                        >
                          {step.num}
                        </i>
                        <span
                          className={
                            step.done ? "text-[#cfd7d4]" : undefined
                          }
                        >
                          {t(`sections.${step.key}`)}
                        </span>
                        <Icon
                          name={step.icon}
                          className="ms-auto h-2.5 w-2.5 text-[#5e7b75]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <span className="mono-label mt-4 inline-flex items-center gap-1.5 rounded-full border border-accent/[0.16] px-2.5 py-1.5 text-[8px] tracking-[0.1em] text-[#8fc0b6]">
                  {t("sections.controls")}
                </span>
              </div>
            </article>
          </Reveal>

          <Reveal className="h-full min-w-0 lg:col-span-4">
            <article className={cardClass}>
              <div aria-hidden className={glowClass} />
              <CardTop
                icon="chart"
                tag={t("neverEmpty.tag")}
                index={t("neverEmpty.index")}
              />
              <h3 className="relative mt-8 text-[clamp(21px,2.4vw,25px)] leading-[1.1] font-normal tracking-[-0.035em] text-[#efefec]">
                {t("neverEmpty.title")}
              </h3>

              <div className="relative mt-auto flex items-center gap-5 pt-7">
                <div className="relative grid h-[104px] w-[104px] shrink-0 place-items-center rounded-full bg-[conic-gradient(from_220deg,rgba(94,234,212,0.9)_0_58%,rgba(255,255,255,0.085)_58%_100%)]">
                  <div
                    aria-hidden
                    className="absolute inset-[7px] rounded-full border border-white/5 bg-[#0c0d0f]"
                  />
                  <div className="relative z-10 text-center">
                    <span className="block text-[22px] leading-none font-light tracking-[-0.04em] text-[#f0f0ed]">
                      {t("neverEmpty.value")}
                    </span>
                    <small className="mono-label mt-1 block text-[6.5px] leading-none tracking-[0.1em] text-[#6e6e76]">
                      {t("neverEmpty.unit")}
                    </small>
                  </div>
                </div>

                <div className="grid flex-1 gap-2">
                  {ringLegend.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-1.5 text-[9px] text-[#85858d]"
                    >
                      <i
                        className={`h-[5px] w-[5px] shrink-0 rounded-full ${item.dot}`}
                      />
                      <span className="min-w-0 truncate">
                        {t(`neverEmpty.${item.key}`)}
                      </span>
                      <b className="ms-auto font-mono text-[8.5px] font-medium text-[#c8c8c9]">
                        {t(`neverEmpty.${item.value}`)}
                      </b>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
