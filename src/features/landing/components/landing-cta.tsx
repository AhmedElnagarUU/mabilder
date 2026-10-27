import Link from "next/link";
import { buttonClass } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";

export function LandingPrinciple() {
  return (
    <section id="principle" className="pt-[140px]">
      <div className="mx-auto w-full max-w-[1180px] px-5">
        <div className="grid grid-cols-1 gap-10 border-y border-line py-14 lg:grid-cols-[0.86fr_1.14fr] lg:gap-20">
          <div>
            <p className="eyebrow text-soft">04 — The principle</p>
            <div className="mt-8 flex items-center gap-3.5">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-white shadow-[0_12px_24px_-14px_rgba(6,91,92,0.6),inset_0_1px_0_rgba(255,255,255,0.22)]">
                <Icon name="spark" className="h-5 w-5" />
              </span>
              <div>
                <b className="block text-xs font-medium tracking-[-0.01em]">
                  Website Studio
                </b>
                <span className="mono-label mt-0.5 block text-[7.5px] tracking-[0.08em] text-faint">
                  Built for small teams
                </span>
              </div>
            </div>
            <div className="mono-label mt-7 text-[7.5px] tracking-[0.08em] text-faint">
              Six pages · One voice
            </div>
          </div>

          <div>
            <blockquote className="font-display text-[clamp(25px,2.9vw,38px)] leading-[1.18] font-normal tracking-[-0.043em] text-balance">
              “The business already knows what it is.{" "}
              <span className="text-faint">
                The website should catch up.
              </span>
              ”
            </blockquote>
            <div className="mono-label mt-7 flex flex-wrap items-center gap-4 text-[7.5px] tracking-[0.08em] text-faint">
              <span>Website Studio / design principle</span>
              <span aria-hidden>·</span>
              <span>No templates to choose</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingCta() {
  return (
    <section id="start" className="px-5 pt-[130px] pb-[90px]">
      <div className="mx-auto w-full max-w-[1180px]">
        <div className="cta-panel relative overflow-hidden rounded-[34px] px-6 pt-16 pb-8 text-center sm:px-14 sm:pt-20">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -top-[40%] mx-auto h-[600px] w-[900px] bg-[radial-gradient(closest-side,rgba(255,255,255,0.16),rgba(255,255,255,0))]"
          />

          <div className="relative z-10">
            <p className="eyebrow text-white/45">
              05 — Start here
            </p>
            <h2 className="mx-auto mt-6 max-w-[780px] font-display text-[clamp(44px,6vw,82px)] leading-[0.98] font-light tracking-[-0.06em] text-balance">
              Your next site starts
              <br />
              <span className="text-white/40">with a short brief.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-[410px] text-[15px] leading-[1.62] tracking-[-0.012em] text-white/50">
              Open the dashboard, answer four steps, and let the first draft do
              the heavy lifting.
            </p>

            <div className="mt-8 flex justify-center">
              <Link
                href="/dashboard"
                className={buttonClass("inverse", "lg", "gap-2")}
              >
                Open dashboard
                <Icon name="arrow" className="h-[15px] w-[15px]" />
              </Link>
            </div>
            <p className="mono-label mt-3 text-[8px] tracking-[0.1em] text-white/32">
              No code. No page builder. Everything editable.
            </p>

            <div className="mono-label mt-8 flex flex-wrap items-center justify-center gap-4 text-[8px] tracking-[0.1em] text-white/40">
              <span>Four steps</span>
              <i className="h-[3px] w-[3px] rounded-full bg-white/25" />
              <span>Six pages</span>
              <i className="h-[3px] w-[3px] rounded-full bg-white/25" />
              <span>Live editor</span>
            </div>
          </div>

          <div className="relative z-10 mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-white/34 sm:flex-row">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white text-ink">
                <Icon name="spark" className="h-3.5 w-3.5" />
              </span>
              <span className="font-display text-sm tracking-[-0.045em] text-white">
                Website Studio
              </span>
            </Link>
            <span className="mono-label text-[8px] tracking-[0.09em] text-white/34">
              AI website studio / six pages per brief
            </span>
            <span className="mono-label text-[8px] tracking-[0.09em] text-white/34">
              © 2026 Website Studio
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="pb-10">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center justify-between gap-5 border-t border-line px-5 pt-6 sm:flex-row">
        <p className="mono-label text-[8px] tracking-[0.08em] text-faint">
          Website Studio / AI website studio
        </p>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-muted"
        >
          <a href="#how-it-works" className="transition-colors hover:text-ink">
            How it works
          </a>
          <a href="#capabilities" className="transition-colors hover:text-ink">
            Capabilities
          </a>
          <Link href="/dashboard" className="transition-colors hover:text-ink">
            Dashboard
          </Link>
        </nav>
        <div className="mono-label flex items-center gap-2 text-[8px] tracking-[0.08em] text-faint">
          <i className="h-[5px] w-[5px] rounded-full bg-accent shadow-[0_0_0_3px_rgba(11,139,134,0.12)]" />
          Studio ready
        </div>
      </div>
    </footer>
  );
}
