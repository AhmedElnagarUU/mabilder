import type { ReactNode } from "react";
import Link from "next/link";
import { buttonClass } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";

function SidebarLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: "grid" | "plus" | "home" | "spark";
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-[38px] items-center gap-2.5 rounded-[10px] px-2.5 text-xs transition-colors ${
        active
          ? "bg-accent text-white shadow-[0_8px_18px_-10px_rgba(6,91,92,0.55)]"
          : "text-soft hover:bg-accent/10 hover:text-ink"
      }`}
    >
      <Icon name={icon} className="h-[15px] w-[15px] opacity-70" />
      {label}
    </Link>
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen p-3.5">
      <div
        aria-hidden
        className="studio-grid pointer-events-none fixed inset-0 z-0"
      />

      <div className="relative z-10 flex gap-3.5">
        <aside className="glass sticky top-3.5 hidden h-[calc(100vh-28px)] w-[244px] shrink-0 flex-col rounded-[26px] px-3.5 pt-5 pb-3.5 lg:flex">
          <div className="px-2">
            <Logo />
          </div>

          <div className="mt-5 mb-[22px] flex items-center gap-2.5 rounded-[13px] border border-line bg-white/55 px-2.5 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-[linear-gradient(145deg,#0b8b86,#065b5c)] font-mono text-[9px] text-white">
              W
            </span>
            <div className="min-w-0 flex-1">
              <b className="block text-[11px] font-medium tracking-[-0.01em]">
                Website Studio
              </b>
              <small className="mono-label block text-[6.5px] tracking-[0.06em] text-faint">
                Six-page studio
              </small>
            </div>
            <span className="rounded border border-line px-1 py-0.5 font-mono text-[6px] tracking-[0.08em] text-faint">
              STUDIO
            </span>
          </div>

          <p className="mono-label px-2 text-[7px] tracking-[0.14em] text-faint">
            Your studio
          </p>
          <nav aria-label="Studio" className="mt-2 flex flex-col gap-0.5">
            <SidebarLink href="/dashboard" label="Overview" icon="grid" active />
            <SidebarLink href="/dashboard/new" label="New website" icon="plus" />
          </nav>

          <p className="mono-label mt-4 px-2 text-[7px] tracking-[0.14em] text-faint">
            Public site
          </p>
          <nav aria-label="Public site" className="mt-2 flex flex-col gap-0.5">
            <SidebarLink href="/" label="Landing page" icon="home" />
            <SidebarLink
              href="/#how-it-works"
              label="How it works"
              icon="spark"
            />
          </nav>

          <div className="mt-auto">
            <div className="relative mb-3 overflow-hidden rounded-[15px] bg-[linear-gradient(160deg,#0a5b5c,#032b2e)] p-4 text-white shadow-[0_18px_34px_-22px_rgba(2,38,41,0.6)]">
              <span
                aria-hidden
                className="absolute -top-11 -right-10 h-[110px] w-[110px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.2),transparent)]"
              />
              <p className="mono-label relative text-[7px] tracking-[0.14em] text-white/40">
                Quietly powerful
              </p>
              <h2 className="relative mt-2.5 font-display text-[17px] leading-[1.12] font-normal tracking-[-0.04em]">
                Your next site
                <br />
                is one brief away.
              </h2>
              <p className="relative mt-1.5 text-[9px] leading-[1.5] text-white/45">
                Four steps. Six pages. One calm editor.
              </p>
              <Link
                href="/dashboard/new"
                className="relative mt-3.5 flex h-8 items-center justify-between rounded-full bg-white px-3 text-[9.5px] font-medium text-ink"
              >
                Start a site
                <Icon name="arrow" className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex items-center gap-2.5 border-t border-line px-2 pt-3">
              <span className="grid h-[30px] w-[30px] place-items-center rounded-full border border-accent/15 bg-[#d3eeea] font-mono text-[8px] text-soft">
                W
              </span>
              <div className="min-w-0 flex-1">
                <b className="block text-[10.5px] font-medium">Website Studio</b>
                <small className="block text-[8px] text-faint">
                  Personal workspace
                </small>
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-1 pb-8 lg:px-0">
          <div className="glass mb-4 flex h-14 items-center justify-between gap-3 rounded-full pr-1.5 pl-4 lg:hidden">
            <Logo />
            <Link
              href="/dashboard/new"
              className={buttonClass("primary", "sm", "px-3.5")}
            >
              New website
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
