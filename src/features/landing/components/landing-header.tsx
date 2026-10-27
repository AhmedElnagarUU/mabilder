import Link from "next/link";
import { buttonClass } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";

export function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-[18px] z-50">
      <nav
        aria-label="Main"
        className="mx-auto flex h-[62px] w-[min(1180px,calc(100%-40px))] items-center gap-8 rounded-full border border-white/85 bg-white/65 pr-2.5 pl-5 shadow-[0_16px_40px_-26px_rgba(2,48,51,0.35),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-[22px] backdrop-saturate-110"
      >
        <Logo />

        <div className="ms-1 hidden items-center gap-7 md:flex">
          <a
            href="#how-it-works"
            className="text-[13.5px] text-soft transition-colors hover:text-ink"
          >
            How it works
          </a>
          <a
            href="#capabilities"
            className="text-[13.5px] text-soft transition-colors hover:text-ink"
          >
            Capabilities
          </a>
          <a
            href="#principle"
            className="text-[13.5px] text-soft transition-colors hover:text-ink"
          >
            The principle
          </a>
        </div>

        <div className="ms-auto flex items-center gap-2">
          <Link
            href="/dashboard"
            className={buttonClass("primary", "sm", "px-4")}
          >
            Open dashboard
          </Link>
        </div>
      </nav>
    </header>
  );
}
