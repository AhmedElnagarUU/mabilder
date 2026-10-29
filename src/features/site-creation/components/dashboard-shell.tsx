import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { SignOutButton } from "@/features/auth/components/sign-out-button";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { LocaleSwitcher } from "@/shared/i18n/locale-switcher";
import { Link } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";
import { Logo } from "@/shared/ui/logo";
import type { SiteSummary } from "../types";

function initialOf(name: string): string {
  return (name.trim()[0] ?? "W").toUpperCase();
}

function SidebarLink({
  href,
  label,
  icon,
  active = false,
  external = false,
}: {
  href: string;
  label: string;
  icon: IconName;
  active?: boolean;
  external?: boolean;
}) {
  const className = `flex h-[38px] w-[42px] items-center justify-center rounded-[9px] border text-soft transition-colors min-[980px]:w-full min-[980px]:justify-start min-[980px]:gap-2.5 min-[980px]:px-3 ${
    active
      ? "border-white/[0.07] bg-white/[0.065] text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
      : "border-transparent hover:bg-white/[0.033] hover:text-ink"
  }`;

  const iconElement = (
    <Icon name={icon} className="h-[15px] w-[15px] shrink-0 opacity-70" />
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {iconElement}
        <span className="hidden truncate text-sm min-[980px]:inline">
          {label}
        </span>
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {iconElement}
      <span className="hidden truncate text-sm min-[980px]:inline">{label}</span>
    </Link>
  );
}

export async function DashboardShell({
  user,
  site,
  crumbLabel,
  children,
}: {
  user: { name: string; email: string };
  site?: Pick<SiteSummary, "id"> | null;
  crumbLabel: string;
  children: ReactNode;
}) {
  const t = await getTranslations("dashboard");
  const common = await getTranslations("common");

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="studio-grid pointer-events-none fixed inset-0 z-0"
      />

      <div className="relative z-10 mx-auto flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[68px] shrink-0 flex-col border-e border-line-soft bg-[linear-gradient(180deg,rgba(11,11,13,0.85),rgba(6,6,7,0.92))] px-2.5 py-5 backdrop-blur-2xl md:flex min-[980px]:w-[224px] min-[980px]:px-[17px]">
          <Link href="/dashboard" className="grid place-items-center rounded-lg px-1 min-[980px]:flex min-[980px]:items-center min-[980px]:gap-2.5 min-[980px]:px-2 min-[980px]:justify-start">
            <Logo showName={false} href={null} />
            <span className="hidden font-display text-[17px] font-medium tracking-[-0.03em] text-ink min-[980px]:inline">
              {common("appName")}
            </span>
          </Link>

          <div className="mt-6 flex items-center gap-2.5 justify-center rounded-[11px] border border-line-soft bg-white/[0.022] p-2 min-[980px]:justify-start min-[980px]:p-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] border border-white/10 bg-[linear-gradient(145deg,#28312f,#121817)] font-mono text-[13px] text-[#c8ded8]">
              {initialOf(user.name)}
            </span>
            <span className="hidden min-w-0 min-[980px]:block">
              <small className="mono-label block text-[11px] tracking-[0.13em] text-dim">
                {t("sidebar.account")}
              </small>
              <b className="mt-0.5 flex items-center gap-1 truncate text-[13px] font-medium text-[#d6d6d4]">
                <span className="truncate">{user.name}</span>
              </b>
              <small className="block truncate text-[11px] text-faint">
                <bdi dir="ltr">{user.email}</bdi>
              </small>
            </span>
          </div>

          <p className="mono-label mt-6 hidden px-2 text-[11px] tracking-[0.14em] text-faint min-[980px]:block">
            {t("sidebar.navLabel")}
          </p>
          <nav
            aria-label={t("sidebar.aria")}
            className="mt-2 flex min-[980px]:flex-col flex-col gap-0.5 min-[980px]:items-stretch items-center"
          >
            <SidebarLink
              href="/dashboard"
              label={t("sidebar.overview")}
              icon="home"
              active
            />
            {site ? (
              <>
                <SidebarLink
                  href={`/edit/${site.id}`}
                  label={t("sidebar.editWebsite")}
                  icon="pen"
                />
                <SidebarLink
                  href="/dashboard/projects"
                  label={t("sidebar.projects")}
                  icon="layers"
                />
                <SidebarLink
                  href={`/preview/${site.id}/index.html`}
                  label={t("sidebar.previewSite")}
                  icon="monitor"
                  external
                />
              </>
            ) : null}
          </nav>

        </aside>

        <div className="min-w-0 flex-1 px-3.5 pb-8 sm:px-6 lg:px-8">
          <header className="flex h-14 items-center justify-between gap-4 border-b border-line-soft">
            <div className="flex items-center gap-3">
              <span className="md:hidden">
                <Logo showName={false} href="/dashboard" />
              </span>
              <p className="hidden items-center gap-2 text-[13px] text-faint sm:flex">
                <b className="font-medium text-soft">{common("appName")}</b>
                <Icon name="chevron" className="h-2.5 w-2.5 -rotate-90 rtl:rotate-90" />
                <span className="text-ink">{crumbLabel}</span>
              </p>
              <nav
                aria-label={t("sidebar.aria")}
                className="flex items-center gap-1.5 md:hidden"
              >
                <Link
                  href="/dashboard"
                  aria-label={t("sidebar.overview")}
                  title={t("sidebar.overview")}
                  className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white/[0.045] text-soft"
                >
                  <Icon name="home" className="h-4 w-4" />
                </Link>
                {site ? (
                  <>
                    <Link
                      href={`/edit/${site.id}`}
                      aria-label={t("sidebar.editWebsite")}
                      title={t("sidebar.editWebsite")}
                      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white/[0.045] text-soft"
                    >
                      <Icon name="pen" className="h-4 w-4" />
                    </Link>
                    <a
                      href={`/preview/${site.id}/index.html`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("sidebar.previewSite")}
                      title={t("sidebar.previewSite")}
                      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white/[0.045] text-soft"
                    >
                      <Icon name="monitor" className="h-4 w-4" />
                    </a>
                  </>
                ) : null}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              <LocaleSwitcher
                className={buttonClass("secondary", "sm", "px-3.5")}
              />
              <SignOutButton className={buttonClass("secondary", "sm", "px-3.5")} />
            </div>
          </header>

          {children}
        </div>
      </div>
    </div>
  );
}
