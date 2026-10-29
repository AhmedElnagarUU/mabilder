import type { ReactNode } from "react";
import { Link } from "@/shared/i18n/navigation";
import { AdminSignOutButton } from "./sign-out-button";

const linkClass =
  "block rounded-xl px-3 py-2 text-sm text-soft transition hover:bg-white/[0.06] hover:text-ink";

const comingSoon = ["Feedback"];

export function AdminShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-1 bg-canvas text-ink">
      <aside className="flex w-56 shrink-0 flex-col gap-1 border-e border-line bg-surface p-4">
        <p className="mb-4 px-3 font-mono text-xs tracking-[0.1em] text-muted uppercase">
          Admin
        </p>
        <Link href="/admin" className={linkClass}>
          Overview
        </Link>
        <Link href="/admin/users" className={linkClass}>
          Users
        </Link>
        <Link href="/admin/payments" className={linkClass}>
          Payments
        </Link>
        <Link href="/admin/settings" className={linkClass}>
          Settings
        </Link>
        {comingSoon.map((label) => (
          <span
            key={label}
            aria-disabled="true"
            className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-faint"
          >
            {label}
            <span className="text-xs">soon</span>
          </span>
        ))}
        <div className="mt-auto border-t border-line pt-3">
          <AdminSignOutButton />
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-8">
        <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
        {children}
      </main>
    </div>
  );
}
