import type { ReactNode } from "react";
import { LocaleSwitcher } from "@/shared/i18n/locale-switcher";
import { buttonClass } from "@/shared/ui/button";
import { Logo } from "@/shared/ui/logo";

export function AuthPageShell({
  eyebrow,
  title,
  intro,
  footer,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="studio-grid pointer-events-none fixed inset-0 z-0"
      />

      <div className="relative z-10 flex min-h-screen flex-col px-4 sm:px-6">
        <header className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4">
          <Logo />
          <LocaleSwitcher className={buttonClass("secondary", "sm", "px-3.5")} />
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <p className="eyebrow text-soft">{eyebrow}</p>
            <h1 className="mt-4 font-display text-[clamp(32px,4vw,44px)] leading-[1.02] font-normal tracking-[-0.05em]">
              {title}
            </h1>
            <p className="mt-3 text-[13px] leading-[1.65] text-muted">{intro}</p>

            <div className="glass mt-8 rounded-[30px] p-5 sm:p-7">{children}</div>

            <p className="mt-5 text-center text-xs text-muted">{footer}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
