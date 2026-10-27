import Link from "next/link";
import { buttonClass } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";

const pages = [
  { name: "Home", icon: "home" as IconName, active: true },
  { name: "Studio", icon: "text" as IconName },
  { name: "Services", icon: "layout" as IconName },
  { name: "Work", icon: "grid" as IconName },
  { name: "Profile", icon: "pages" as IconName },
  { name: "Contact", icon: "pen" as IconName },
];

const kpis = [
  { label: "Pages", value: "06" },
  { label: "Words drafted", value: "1,840" },
  { label: "Images placed", value: "24" },
];

const pageRows = [
  { name: "Home", detail: "Hero, services, selected work", tag: "Ready" },
  { name: "Studio", detail: "Story, approach, team", tag: "Ready" },
  { name: "Services", detail: "Four offerings, process", tag: "Ready" },
  { name: "Contact", detail: "Form, email, location", tag: "Ready" },
];

function HeroPreview() {
  return (
    <div className="relative mx-auto mt-[66px] w-[min(1120px,calc(100%-40px))]">
      <div className="absolute -top-24 -right-28 h-72 w-72 rounded-full bg-[#b4ece6]/45 blur-3xl" />

      <div className="absolute top-28 -left-8 z-10 hidden items-center gap-2.5 rounded-[13px] border border-white/95 bg-white/80 px-3.5 py-2.5 shadow-[0_18px_40px_-22px_rgba(2,48,51,0.36),inset_0_1px_0_#fff] backdrop-blur-[18px] lg:flex">
        <span className="h-1.5 w-1.5 rounded-full bg-ink shadow-[0_0_0_4px_rgba(6,91,92,0.16)]" />
        <div>
          <span className="mono-label block text-[9px] tracking-[0.09em] text-faint">
            AI draft
          </span>
          <b className="block text-[12.5px] font-medium tracking-[-0.01em]">
            Six pages written
          </b>
        </div>
      </div>

      <div className="absolute -right-6 bottom-24 z-10 hidden rounded-[13px] border border-white/95 bg-white/80 px-3.5 py-2.5 shadow-[0_18px_40px_-22px_rgba(2,48,51,0.36),inset_0_1px_0_#fff] backdrop-blur-[18px] lg:block">
        <span className="mono-label block text-[9px] tracking-[0.09em] text-faint">
          Live editor
        </span>
        <b className="block text-[12.5px] font-medium tracking-[-0.01em]">
          Click any word
        </b>
      </div>

      <div className="relative rounded-[34px] border border-white/80 bg-white/40 p-2.5 shadow-[0_70px_120px_-60px_rgba(2,38,41,0.5),0_20px_50px_-30px_rgba(2,48,51,0.24),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-[20px]">
        <div className="overflow-hidden rounded-[25px] border border-ink/10 bg-white shadow-[inset_0_1px_0_#fff]">
          <div className="flex h-[38px] items-center gap-3 border-b border-ink/5 bg-[#f2faf9] px-3.5">
            <div className="flex gap-1.5" aria-hidden>
              <i className="h-[7px] w-[7px] rounded-full bg-[#b4ece6]" />
              <i className="h-[7px] w-[7px] rounded-full bg-[#dcf6f3]" />
              <i className="h-[7px] w-[7px] rounded-full bg-[#dcf6f3]" />
            </div>
            <div className="mx-auto flex h-[22px] w-full max-w-[280px] items-center justify-center gap-1.5 rounded-md bg-[#e6f6f4] font-mono text-[9px] tracking-[0.06em] text-[#65807f]">
              <Icon name="shield" className="h-2 w-2" />
              studio / northline-studio
            </div>
            <div className="hidden items-center gap-2.5 font-mono text-[9px] tracking-[0.08em] text-faint sm:flex">
              <span>PREVIEW</span>
              <span>READY</span>
            </div>
          </div>

          <div className="flex min-h-0 sm:min-h-[430px]">
            <aside className="hidden w-[186px] shrink-0 flex-col bg-[#032b2e] p-[18px] text-white sm:flex">
              <div className="mb-7 flex items-center gap-2 font-display text-sm tracking-[-0.04em]">
                <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-white text-ink">
                  <Icon name="spark" className="h-[11px] w-[11px]" />
                </span>
                Website Studio
                <small className="ms-auto font-mono text-[8.5px] tracking-[0.1em] text-white/45">
                  2.0
                </small>
              </div>

              <nav className="flex flex-col gap-0.5" aria-hidden>
                {pages.map((page) => (
                  <span
                    key={page.name}
                    className={`flex h-[30px] items-center gap-2 rounded-lg px-2.5 text-[10.5px] ${
                      page.active
                        ? "bg-white/10 text-white"
                        : "text-white/50"
                    }`}
                  >
                    <Icon
                      name={page.icon}
                      className={`h-3 w-3 ${
                        page.active ? "opacity-100" : "opacity-70"
                      }`}
                    />
                    {page.name}
                  </span>
                ))}
              </nav>

              <div className="mt-auto">
                <span className="mono-label block text-[8.5px] tracking-[0.1em] text-white/45">
                  Site status
                </span>
                <strong className="mt-1 block font-display text-[21px] font-normal tracking-[-0.04em]">
                  Ready to edit
                </strong>
                <div className="mt-2 flex h-[26px] items-end gap-[3px]">
                  {[32, 44, 38, 56, 68, 62, 82, 100].map((height, index) => (
                    <i
                      key={index}
                      className={`flex-1 rounded-[1px] ${
                        index === 7 ? "bg-white" : "bg-white/25"
                      }`}
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </aside>

            <div className="min-w-0 flex-1 bg-gradient-to-b from-white to-[#f6fcfb] p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-display text-[17px] font-medium tracking-[-0.035em]">
                    Northline Studio
                  </h4>
                  <p className="mt-0.5 text-[10.5px] text-muted">
                    A calm architectural practice in Zurich.
                  </p>
                </div>
                <span className="flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-2.5 font-mono text-[8.5px] tracking-[0.04em] text-soft">
                  <Icon name="pages" className="h-2.5 w-2.5" />
                  Six pages
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {kpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="rounded-[10px] border border-ink/5 bg-white px-3 py-2.5"
                  >
                    <span className="mono-label block text-[8.5px] tracking-[0.08em] text-faint">
                      {kpi.label}
                    </span>
                    <b className="mt-1 block font-display text-[18px] font-medium tracking-[-0.045em]">
                      {kpi.value}
                    </b>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-xl border border-ink/5 bg-white px-3.5 py-3">
                <div className="mb-1 flex items-center justify-between">
                  <b className="font-display text-[13.5px] font-medium tracking-[-0.02em]">
                    The site, page by page
                  </b>
                  <span className="font-mono text-[8px] tracking-[0.08em] text-faint">
                    DRAFTED / READY
                  </span>
                </div>

                <div className="flex flex-col">
                  {pageRows.map((row) => (
                    <div
                      key={row.name}
                      className="flex items-center gap-2.5 border-t border-ink/5 py-2 first:border-t-0"
                    >
                      <i className="grid h-5 w-5 place-items-center rounded-md bg-[#e6f6f4] text-soft">
                        <Icon name="layout" className="h-2.5 w-2.5" />
                      </i>
                      <div className="min-w-0 flex-1">
                        <b className="block text-[10px] font-medium tracking-[-0.01em]">
                          {row.name}
                        </b>
                        <small className="block truncate font-mono text-[8px] tracking-[0.03em] text-faint">
                          {row.detail}
                        </small>
                      </div>
                      <span className="flex shrink-0 items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono text-[8px] tracking-[0.07em] text-soft">
                        <i className="h-[3px] w-[3px] rounded-full bg-ink" />
                        {row.tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const trio = [
  {
    icon: "pages" as IconName,
    title: "A complete website",
    body: "Six pages written from one brief, in a single consistent voice.",
  },
  {
    icon: "pen" as IconName,
    title: "A real visual editor",
    body: "Edit the generated page itself — type, images, links and lists.",
  },
  {
    icon: "monitor" as IconName,
    title: "Static by default",
    body: "Fast HTML output with no runtime to maintain and no page builder.",
  },
];

export function LandingHero() {
  return (
    <section id="product" className="relative overflow-hidden pt-[168px]">
      <div className="mx-auto w-full max-w-[1180px] px-5 text-center">
        <div className="mx-auto grid h-[46px] w-[46px] place-items-center rounded-full bg-accent text-white shadow-[0_16px_30px_-16px_rgba(6,91,92,0.7),inset_0_1px_0_rgba(255,255,255,0.2)]">
          <Icon name="spark" className="h-5 w-5" />
        </div>

        <p className="mono-label mt-[18px] mb-[22px] text-muted">
          AI website studio <span className="text-ink">/ one short brief</span>
        </p>

        <h1 className="mx-auto max-w-[970px] font-display text-[clamp(54px,7.4vw,104px)] leading-[0.96] font-normal tracking-[-0.062em] text-balance">
          A finished website
          <br />
          <span className="text-faint">from a short brief.</span>
        </h1>

        <p className="mx-auto mt-[26px] max-w-[500px] text-[17px] leading-[1.6] tracking-[-0.012em] text-soft text-balance">
          Website Studio is the AI studio for small businesses that need a
          considered web presence. Answer four steps and get six pages — then{" "}
          <b className="font-medium text-ink">shape them in one calm editor.</b>
        </p>

        <div className="mt-[34px] flex flex-wrap items-center justify-center gap-2.5">
          <Link
            href="/dashboard"
            className={buttonClass("primary", "lg", "gap-2")}
          >
            Open dashboard
            <Icon name="arrow" className="h-[15px] w-[15px]" />
          </Link>
          <a
            href="#how-it-works"
            className={buttonClass("secondary", "lg")}
          >
            See how it works
          </a>
        </div>

        <p className="mono-label mt-3 text-[10.5px] tracking-[0.1em] text-muted">
          Four steps · Six pages · No code
        </p>
      </div>

      <HeroPreview />

      <div className="mx-auto mt-[74px] grid w-[min(960px,calc(100%-48px))] grid-cols-1 gap-6 border-b border-line pb-[88px] text-center sm:grid-cols-3">
        {trio.map((item) => (
          <article key={item.title} className="px-[18px]">
            <div className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full bg-accent text-white shadow-[0_12px_24px_-14px_rgba(6,91,92,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Icon name={item.icon} className="h-[18px] w-[18px]" />
            </div>
            <h3 className="font-display text-[17px] font-medium tracking-[-0.03em]">
              {item.title}
            </h3>
            <p className="mx-auto mt-[7px] max-w-[250px] text-[13px] leading-[1.6] text-muted">
              {item.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
