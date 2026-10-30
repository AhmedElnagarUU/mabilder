import type { ReactNode } from "react";
import { Link } from "@/shared/i18n/navigation";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";
import { AdminSignOutButton } from "./sign-out-button";

export type AdminNavId = "overview" | "users" | "feedback" | "payments" | "settings";

const navGroups: {
  label: string;
  items: { id: AdminNavId; href: string; label: string; icon: IconName }[];
}[] = [
  {
    label: "Workspace",
    items: [
      { id: "overview", href: "/admin", label: "Overview", icon: "home" },
      { id: "users", href: "/admin/users", label: "Users", icon: "layers" },
      { id: "feedback", href: "/admin/feedback", label: "Feedback", icon: "text" },
    ],
  },
  {
    label: "Billing",
    items: [
      { id: "payments", href: "/admin/payments", label: "Payments", icon: "chart" },
      { id: "settings", href: "/admin/settings", label: "Settings", icon: "shield" },
    ],
  },
];

function navLinkClass(active: boolean) {
  return `flex h-[38px] items-center gap-2.5 rounded-[9px] border px-3 text-sm text-soft transition-colors ${
    active
      ? "border-white/[0.07] bg-white/[0.065] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      : "border-transparent hover:bg-white/[0.033] hover:text-ink"
  }`;
}

function NavGroups({ active }: { active?: AdminNavId }) {
  return (
    <>
      {navGroups.map((group) => (
        <div key={group.label} className="mt-5 first:mt-2">
          <p className="mono-label px-2 text-[11px] tracking-[0.14em] text-faint">{group.label}</p>
          <ul className="mt-2 flex flex-col gap-0.5">
            {group.items.map((item) => (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={navLinkClass(active === item.id)}
                  aria-current={active === item.id ? "page" : undefined}
                >
                  <Icon name={item.icon} className="h-[15px] w-[15px] shrink-0 opacity-70" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export function AdminShell({
  title,
  active,
  children,
}: {
  title: string;
  active?: AdminNavId;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="studio-grid pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10 mx-auto flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[224px] shrink-0 flex-col border-e border-line-soft bg-[linear-gradient(180deg,rgba(11,11,13,0.85),rgba(6,6,7,0.92))] px-[17px] py-5 backdrop-blur-2xl md:flex">
          <Link href="/admin" className="flex items-center gap-2.5 rounded-lg px-2">
            <Logo showName={false} href={null} />
            <span className="font-display text-[17px] font-medium tracking-[-0.03em] text-ink">Admin</span>
          </Link>
          <nav aria-label="Admin" className="mt-6 flex flex-col">
            <NavGroups active={active} />
          </nav>
          <div className="mt-auto border-t border-line-soft pt-3">
            <AdminSignOutButton />
          </div>
        </aside>

        <div className="min-w-0 flex-1 px-3.5 pb-10 sm:px-6 lg:px-8">
          <header className="flex h-14 items-center justify-between gap-4 border-b border-line-soft">
            <div className="flex items-center gap-3">
              <span className="md:hidden">
                <Logo showName={false} href="/admin" />
              </span>
              <p className="flex items-center gap-2 text-[13px] text-faint">
                <b className="font-medium text-soft">Admin</b>
                <Icon name="chevron" className="h-2.5 w-2.5 -rotate-90 rtl:rotate-90" />
                <span className="text-ink">{title}</span>
              </p>
            </div>
            <details className="group relative md:hidden">
              <summary
                aria-label="Menu"
                className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full border border-line bg-white/[0.045] text-soft [&::-webkit-details-marker]:hidden"
              >
                <Icon name="menu" className="h-4 w-4" />
              </summary>
              <div className="glass absolute end-0 top-11 z-30 w-56 rounded-2xl p-3">
                <nav aria-label="Admin menu" className="flex flex-col">
                  <NavGroups active={active} />
                </nav>
                <div className="mt-3 border-t border-line-soft pt-3">
                  <AdminSignOutButton />
                </div>
              </div>
            </details>
          </header>

          <main className="pt-8">
            <h1 className="mb-6 font-display text-[28px] leading-tight font-normal tracking-[-0.04em]">
              {title}
            </h1>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
