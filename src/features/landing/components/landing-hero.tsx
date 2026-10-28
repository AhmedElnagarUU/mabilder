import { getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";

const rays = [
  "start-[20%] top-[120px] h-[440px] opacity-50",
  "start-[30%] top-[235px] h-[330px] opacity-30",
  "end-[30%] top-[235px] h-[330px] opacity-30",
  "end-[20%] top-[120px] h-[440px] opacity-50",
];

const sheetProjects = [
  {
    name: "projectOneName",
    meta: "projectOneMeta",
    photo:
      "bg-[linear-gradient(135deg,#3b4a4d,#141b1d_55%,#1f3b38)]",
  },
  {
    name: "projectTwoName",
    meta: "projectTwoMeta",
    photo:
      "bg-[linear-gradient(135deg,#2b3a44,#0f1518_55%,#234541)]",
  },
  {
    name: "projectThreeName",
    meta: "projectThreeMeta",
    photo:
      "bg-[linear-gradient(135deg,#3d3a45,#141318_55%,#2a2f3f)]",
  },
] as const;

async function SiteSheet() {
  const t = await getTranslations("landing.hero.sheet");

  return (
    <div className="relative h-[270px] w-[min(780px,calc(100vw-28px))] animate-card-float motion-reduce:animate-none sm:h-[350px] lg:h-[410px]">
      <div className="relative h-full w-full [filter:drop-shadow(0_55px_90px_rgba(0,0,0,0.65))_drop-shadow(0_12px_26px_rgba(0,0,0,0.5))] [transform-style:preserve-3d] [transform:rotateX(38deg)_rotateY(8deg)_rotateZ(-6deg)] sm:[transform:rotateX(47deg)_rotateY(10deg)_rotateZ(-9deg)]">
        <div className="absolute inset-0 overflow-hidden rounded-[27px] border border-white/[0.16] bg-[radial-gradient(95%_160%_at_16%_-8%,rgba(104,132,144,0.25),transparent_56%),radial-gradient(60%_90%_at_88%_106%,rgba(43,122,118,0.12),transparent_68%),linear-gradient(118deg,#0b0f11_0%,#0c1113_34%,#080b0d_68%,#060809_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.19),inset_0_-1px_0_rgba(255,255,255,0.045),inset_0_0_70px_rgba(0,0,0,0.45)]">
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(114deg,transparent_8%,rgba(255,255,255,0.085)_25%,transparent_38%,transparent_57%,rgba(255,255,255,0.04)_63%,transparent_72%),radial-gradient(60%_46%_at_44%_45%,rgba(94,234,212,0.09),transparent_68%)] mix-blend-screen"
          />
          <div
            aria-hidden
            className="absolute -start-[20%] -top-[60%] h-[200%] w-[90%] rotate-[22deg] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.13),transparent_62%)] blur-[18px]"
          />

          <div className="relative flex h-full flex-col">
            <div className="flex h-[30px] shrink-0 items-center gap-2 border-b border-white/[0.07] px-3 sm:h-[34px] sm:px-5">
              <span aria-hidden className="flex gap-1">
                <i className="h-[5px] w-[5px] rounded-full bg-white/20" />
                <i className="h-[5px] w-[5px] rounded-full bg-white/20" />
                <i className="h-[5px] w-[5px] rounded-full bg-white/20" />
              </span>
              <span
                dir="ltr"
                className="mx-auto max-w-[50%] truncate rounded-[5px] bg-white/[0.05] px-2.5 py-1 font-mono text-[7px] tracking-[0.04em] text-white/45 sm:text-[8px]"
              >
                {t("url")}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/10 px-2 py-0.5 font-mono text-[7px] text-white/50">
                <b className="font-medium text-white/80">{t("langEn")}</b>
                <i className="h-2 w-px bg-white/15" />
                <span>{t("langAr")}</span>
              </span>
            </div>

            <div className="flex h-[28px] shrink-0 items-center gap-3 border-b border-white/[0.05] px-3 sm:px-5">
              <b className="truncate text-[9px] font-medium tracking-[-0.02em] text-[#efefec] sm:text-[11px]">
                {t("brand")}
              </b>
              <span className="ms-auto hidden items-center gap-3 text-[7.5px] text-white/40 sm:flex">
                <span>{t("nav.projects")}</span>
                <span>{t("nav.services")}</span>
                <span>{t("nav.about")}</span>
                <span>{t("nav.contact")}</span>
              </span>
            </div>

            <div className="relative min-h-0 flex-1 px-3 sm:px-5">
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] opacity-70 [background-size:26px_26px] [mask-image:radial-gradient(70%_70%_at_50%_50%,#000,transparent)]"
              />
              <svg
                viewBox="0 0 240 120"
                aria-hidden
                className="absolute end-0 bottom-0 h-full w-[52%] max-w-[240px] text-white/25"
              >
                <path
                  d="M10 118V62h48v56M58 118V30h70v88M128 118V48h44v70M172 118V74h58v44"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M70 44h46M70 58h46M70 72h46M70 86h46M70 100h46M140 62h20M140 78h20M140 94h20"
                  stroke="currentColor"
                  strokeWidth="0.8"
                  opacity="0.55"
                />
              </svg>
              <div className="relative z-[1] flex h-full flex-col justify-end pb-2 sm:pb-3">
                <small className="mono-label text-[6px] tracking-[0.12em] text-white/40 sm:text-[7.5px]">
                  {t("kicker")}
                </small>
                <strong className="mt-1 block text-[11px] leading-[1.15] font-normal tracking-[-0.02em] text-[#f1f1ee] sm:text-[16px] lg:text-[19px]">
                  {t("headlineLine1")}
                  <br />
                  {t("headlineLine2")}
                </strong>
              </div>
            </div>

            <div className="grid shrink-0 grid-cols-3 gap-1.5 px-3 pb-3 sm:gap-2 sm:px-5 sm:pb-5">
              {sheetProjects.map((project) => (
                <div
                  key={project.name}
                  className="min-w-0 rounded-md border border-white/[0.07] bg-white/[0.035] p-1.5 sm:p-2"
                >
                  <i
                    className={`block h-6 rounded-[3px] sm:h-10 ${project.photo}`}
                  />
                  <b className="mt-1 block truncate text-[6.5px] font-medium text-white/75 sm:text-[9px]">
                    {t(project.name)}
                  </b>
                  <small className="block truncate text-[6px] text-white/35 sm:text-[7px]">
                    {t(project.meta)}
                  </small>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[27px] bg-[linear-gradient(146deg,rgba(255,255,255,0.32),transparent_22%,transparent_70%,rgba(94,234,212,0.16)_88%,rgba(255,255,255,0.2))] p-px opacity-55 [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude] [-webkit-mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [-webkit-mask-composite:xor]"
        />
      </div>
    </div>
  );
}

export async function LandingHero() {
  const t = await getTranslations("landing.hero");

  return (
    <section
      id="top"
      className="relative isolate min-h-[900px] overflow-hidden pt-[130px] sm:min-h-[1000px] sm:pt-[145px] lg:min-h-[1070px] lg:pt-[150px]"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(1050px_620px_at_50%_-12%,rgba(120,108,178,0.21),transparent_66%),radial-gradient(780px_560px_at_14%_18%,rgba(91,103,143,0.10),transparent_68%),radial-gradient(700px_540px_at_88%_21%,rgba(115,97,158,0.08),transparent_66%),radial-gradient(980px_520px_at_50%_63%,rgba(202,212,236,0.105),transparent_65%),radial-gradient(1300px_700px_at_50%_84%,rgba(36,44,63,0.22),transparent_70%),linear-gradient(180deg,#08080b_0%,#060607_52%,#050506_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,6,0.78),transparent_18%,transparent_82%,rgba(5,5,6,0.78))]" />

        <svg
          viewBox="0 0 1900 1250"
          fill="none"
          className="absolute inset-x-0 top-[-40px] mx-auto h-[1250px] w-[1900px] opacity-90"
        >
          <defs>
            <linearGradient
              id="hero-ring"
              x1="0"
              y1="0"
              x2="1900"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.18" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.6" />
              <stop offset="0.82" stopColor="#ffffff" stopOpacity="0.14" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient
              id="hero-ring-soft"
              x1="0"
              y1="0"
              x2="1900"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.25" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="0.75" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g opacity="0.65">
            <ellipse
              cx="950"
              cy="930"
              rx="820"
              ry="740"
              stroke="url(#hero-ring)"
            />
            <ellipse
              cx="950"
              cy="1020"
              rx="1070"
              ry="870"
              stroke="url(#hero-ring-soft)"
            />
            <ellipse
              cx="950"
              cy="1180"
              rx="1390"
              ry="980"
              stroke="url(#hero-ring-soft)"
            />
          </g>
          <g opacity="0.42">
            <ellipse
              cx="950"
              cy="760"
              rx="620"
              ry="610"
              stroke="url(#hero-ring)"
            />
            <ellipse
              cx="950"
              cy="690"
              rx="510"
              ry="540"
              stroke="url(#hero-ring-soft)"
            />
          </g>
          <ellipse
            cx="950"
            cy="1260"
            rx="1550"
            ry="830"
            stroke="url(#hero-ring)"
            strokeWidth="1.2"
            opacity="0.7"
          />
          <ellipse
            cx="950"
            cy="1240"
            rx="1290"
            ry="690"
            stroke="url(#hero-ring-soft)"
            opacity="0.55"
          />
        </svg>

        <div className="absolute inset-x-0 top-[545px] mx-auto h-[260px] w-[min(760px,100%)] animate-halo bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.20),rgba(206,219,240,0.08)_38%,transparent_70%)] mix-blend-screen blur-[28px] motion-reduce:animate-none" />
        <div className="absolute inset-x-0 top-[635px] h-[340px] bg-[radial-gradient(ellipse_62%_48%_at_50%_47%,rgba(235,241,252,0.18),rgba(134,150,180,0.06)_42%,transparent_70%)] blur-[22px]" />

        <div className="absolute inset-x-0 top-[185px] mx-auto h-[520px] w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.34)_28%,rgba(255,255,255,0.5)_55%,rgba(255,255,255,0.04)_100%)] opacity-80 shadow-[0_0_26px_5px_rgba(255,255,255,0.075)]" />

        {rays.map((ray) => (
          <span
            key={ray}
            className={`absolute w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.14),transparent)] ${ray}`}
          />
        ))}
        <span className="absolute inset-x-0 top-[110px] mx-auto h-20 w-px bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.14),transparent)] opacity-35" />

        <div className="absolute inset-x-0 top-0 h-[260px] bg-[linear-gradient(180deg,rgba(4,4,5,0.72),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-[260px] bg-[linear-gradient(0deg,var(--color-canvas),transparent)]" />
      </div>

      <div className="relative z-[5] text-center">
        <div className="mx-auto w-[min(1320px,calc(100%-40px))] sm:w-[min(1320px,calc(100%-96px))]">
          <div className="animate-hero-in [animation-delay:60ms] motion-reduce:animate-none">
            <span className="inline-flex min-h-[31px] max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-white/10 bg-[rgba(18,18,21,0.48)] px-[13px] py-1.5 text-[10.5px] tracking-[0.01em] text-[#b9b9c0] shadow-[0_8px_30px_rgba(0,0,0,0.22)] backdrop-blur-[18px]">
              <i className="h-1 w-1 shrink-0 rounded-full bg-[#e9e9e4] shadow-[0_0_10px_rgba(255,255,255,0.85)]" />
              <span>{t("badgeTitle")}</span>
              <span className="hidden text-[#85858c] sm:inline">
                {t("badgeMeta")}
              </span>
            </span>
          </div>

          <h1 className="mx-auto mt-[27px] max-w-[1040px] animate-hero-in text-[clamp(34px,6.5vw,93px)] leading-[0.995] font-light tracking-[-0.057em] text-[#f6f6f3] text-balance [animation-delay:130ms] motion-reduce:animate-none">
            {t("titleLine1")}
            <br />
            {t("titleLine2")}
          </h1>

          <div className="mt-[33px] flex animate-hero-in items-center justify-center gap-2 [animation-delay:210ms] motion-reduce:animate-none">
            <Link
              href="/dashboard"
              className={buttonClass("secondary", "lg", "px-5")}
            >
              {t("primaryCta")}
            </Link>
            <Link
              href="/dashboard"
              aria-label={t("primaryCta")}
              className="grid h-[52px] w-[52px] place-items-center rounded-[15px] bg-[#f4f4f1] text-[#08080a] transition-[background,transform] duration-250 hover:-translate-y-px hover:bg-white"
            >
              <Icon
                name="arrow-up"
                className="h-[18px] w-[18px] rtl:rotate-180"
              />
            </Link>
          </div>

          <p className="mt-[15px] animate-hero-in text-[10px] tracking-[0.015em] text-[#6f6f77] [animation-delay:280ms] motion-reduce:animate-none">
            {t("note")}
          </p>
        </div>
      </div>

      <div className="relative z-[4] mt-[9px] h-[340px] animate-hero-in [animation-delay:300ms] motion-reduce:animate-none sm:h-[460px] lg:h-[518px]">
        <div
          aria-hidden
          className="absolute inset-x-0 top-[57%] mx-auto h-[300px] w-[min(780px,100%)] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(94,234,212,0.16),rgba(120,190,200,0.05)_40%,transparent_70%)] blur-[42px]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 top-[82%] mx-auto h-[120px] w-[min(690px,100%)] -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.85),rgba(0,0,0,0.35)_42%,transparent_72%)] blur-[22px]"
        />
        <div className="absolute inset-0 grid place-items-center">
          <SiteSheet />
        </div>
      </div>
    </section>
  );
}
