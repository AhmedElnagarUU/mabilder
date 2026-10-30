import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { RecentActivity } from "@/features/activity/components/recent-activity";
import { listRecentActivity } from "@/features/activity/service";
import type { ActivityItem } from "@/features/activity/types";
import { requirePageUser } from "@/features/auth/session";
import { DashboardShell } from "@/features/site-creation/components/dashboard-shell";
import { DeleteSiteButton } from "@/features/site-creation/components/delete-site-button";
import { getProjectsOverview } from "@/features/projects/service";
import { getSite, listSites } from "@/features/site-creation/service";
import { computeSiteHealth, type SiteHealth } from "@/features/site-creation/site-health";
import type { SiteSummary } from "@/features/site-creation/types";
import { Link } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Icon, type IconName } from "@/shared/ui/icon";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export const dynamic = "force-dynamic";

const ACTIVITY_LIMIT = 8;

const statusChipStyles: Record<SiteSummary["status"], string> = {
  draft: "border-line text-muted",
  generating: "border-warn/25 text-warn",
  ready: "border-ok/30 text-ok",
  error: "border-danger/25 text-danger",
};

const statusDotStyles: Record<SiteSummary["status"], string> = {
  draft: "bg-faint",
  generating: "bg-warn",
  ready: "bg-ok",
  error: "bg-danger",
};

function formatDate(locale: string, value: string): string {
  return new Date(value).toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initialOf(name: string): string {
  return (name.trim()[0] ?? "W").toUpperCase();
}

function StatusChip({
  status,
  label,
}: {
  status: SiteSummary["status"];
  label: string;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] tracking-[0.08em] uppercase ${statusChipStyles[status]}`}
    >
      <i
        className={`h-[4px] w-[4px] rounded-full ${statusDotStyles[status]} ${
          status === "generating" ? "animate-pulse" : ""
        }`}
      />
      {label}
    </span>
  );
}

function HealthCard({
  href,
  label,
  value,
  detail,
  icon,
}: {
  href: string;
  label: string;
  value: string;
  detail: string;
  icon: IconName;
}) {
  return (
    <Link
      href={href}
      className="block min-w-0 overflow-hidden rounded-panel border border-line-soft bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.012))] p-4 transition-colors hover:border-white/[0.16]"
    >
      <div className="flex items-center justify-between gap-2.5">
        <span className="mono-label text-xs tracking-[0.12em] text-dim">{label}</span>
        <Icon name={icon} className="h-[14px] w-[14px] text-dim" />
      </div>
      <div className="mt-3 font-display text-[19px] leading-snug font-normal tracking-[-0.03em] text-[#f0f0ed]">
        {value}
      </div>
      <p className="mt-2.5 text-xs text-faint">{detail}</p>
    </Link>
  );
}

async function loadHealth(userId: string, siteId: string): Promise<SiteHealth | null> {
  try {
    const [site, overview] = await Promise.all([getSite(userId, siteId), getProjectsOverview(userId)]);

    if (!site?.content) {
      return null;
    }

    return computeSiteHealth(site.content, site.tracking, overview?.projects.length ?? 0);
  } catch (error) {
    console.error(error);
    return null;
  }
}

function MiniSiteSheet({ site }: { site: SiteSummary }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line-soft bg-[linear-gradient(150deg,rgba(94,234,212,0.07),rgba(255,255,255,0.02)_70%)]">
      <div className="flex h-7 items-center gap-1.5 border-b border-line-soft px-3.5">
        <i className="h-[5px] w-[5px] rounded-full bg-white/20" />
        <i className="h-[5px] w-[5px] rounded-full bg-white/20" />
        <i className="h-[5px] w-[5px] rounded-full bg-white/20" />
        <span className="ms-auto font-mono text-[11px] tracking-[0.06em] text-faint">
          <bdi dir="ltr">/{site.slug}</bdi>
        </span>
      </div>
      <div className="relative overflow-hidden px-5 py-8">
        <span
          aria-hidden
          className="absolute -top-14 -end-9 h-40 w-40 rounded-full border border-white/[0.06]"
        />
        <span
          aria-hidden
          className="absolute -top-10 end-6 h-28 w-28 rounded-full border border-white/[0.05]"
        />
        <p className="mono-label text-[11px] tracking-[0.12em] text-faint">
          {site.industry}
        </p>
        <span
          aria-hidden
          className="mt-1 block font-display text-[64px] leading-none font-normal tracking-[-0.07em] text-[#c9dad6]"
        >
          {initialOf(site.businessName)}
        </span>
      </div>
    </div>
  );
}

async function loadActivity(userId: string): Promise<ActivityItem[]> {
  try {
    return await listRecentActivity(userId, ACTIVITY_LIMIT);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function DashboardPage({
  params,
}: PageProps<"/[locale]/dashboard">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requirePageUser(locale, "/dashboard");
  const t = await getTranslations("dashboard");

  let site: SiteSummary | null = null;
  let loadFailed = false;

  try {
    site = (await listSites(user.id))[0] ?? null;
  } catch (error) {
    console.error(error);
    loadFailed = true;
  }

  const activity = await loadActivity(user.id);
  const health = site ? await loadHealth(user.id, site.id) : null;
  const now = new Date();

  if (loadFailed) {
    return (
      <DashboardShell user={user} site={null} crumbLabel={t("breadcrumb")} active="overview">
        <main className="pt-10">
          <div className="rounded-panel border border-danger/20 bg-danger-soft px-4 py-3 text-smtext-danger">
            {t("errors.load_failed")}
          </div>
        </main>
      </DashboardShell>
    );
  }

  const previewHref = site ? `/preview/${site.id}/index.html` : "";
  const editHref = site ? `/edit/${site.id}` : "";

  return (
    <DashboardShell user={user} site={site} crumbLabel={t("breadcrumb")} active="overview">
      <main>
        <div className="flex flex-col gap-4 pt-7 pb-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div>
            <h1 className="font-display text-[clamp(24px,2.4vw,29px)] leading-[1.05] font-light tracking-[-0.045em] text-[#f1f1ee]">
              {t("welcome.title", { name: user.name })}
            </h1>
            <p className="mt-2 text-[13px] text-dim">
              {site ? t("welcome.subtitle") : t("empty.body")}
            </p>
          </div>
          {site ? (
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={previewHref}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClass("secondary", "sm", "gap-1.5")}
              >
                <Icon name="external" className="h-3.5 w-3.5" />
                {t("action.preview")}
              </a>
              <Link href={editHref} className={buttonClass("primary", "sm")}>
                <Icon name="pen" className="h-3.5 w-3.5" />
                {t("action.edit")}
              </Link>
            </div>
          ) : null}
        </div>

        {!site ? (
          <section className="mt-4 rounded-panel border border-line-soft bg-[linear-gradient(160deg,rgba(255,255,255,0.036),rgba(255,255,255,0.01))] px-6 py-16 text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-accent/20 bg-accent/10 text-accent">
              <Icon name="pages" className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-[clamp(24px,2.6vw,32px)] leading-none font-light tracking-[-0.04em]">
              {t("empty.title")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-smleading-[1.65] text-muted">
              {t("empty.body")}
            </p>
            <Link
              href="/dashboard/new"
              className={buttonClass("primary", "md", "mt-7 gap-2")}
            >
              {t("empty.cta")}
              <Icon name="arrow" className="h-3.5 w-3.5 rtl:rotate-180" />
            </Link>
          </section>
        ) : (
          <>
            <section aria-label={t("aria.metrics")} data-tour="dashboard-health" className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-2.5 lg:grid-cols-4">
              <HealthCard
                href={editHref}
                label={t("health.pages.label")}
                value={
                  health
                    ? t("health.pages.value", { pages: health.pages, sections: health.sections })
                    : "—"
                }
                detail={health ? t("health.pages.detail") : t("health.unavailable")}
                icon="pages"
              />
              <HealthCard
                href="/dashboard/projects"
                label={t("health.projects.label")}
                value={health ? t("health.projects.value", { count: health.projects }) : "—"}
                detail={health ? t("health.projects.detail") : t("health.unavailable")}
                icon="layers"
              />
              <HealthCard
                href="/dashboard/seo"
                label={t("health.google.label")}
                value={
                  health
                    ? t("health.google.value", {
                        ready: health.pagesWithDescription,
                        total: health.pages,
                      })
                    : "—"
                }
                detail={health ? t("health.google.detail") : t("health.unavailable")}
                icon="globe"
              />
              <HealthCard
                href="/dashboard/tracking"
                label={t("health.tracking.label")}
                value={
                  health
                    ? t("health.tracking.value", {
                        connected: health.trackingConnected,
                        total: health.trackingTotal,
                      })
                    : "—"
                }
                detail={health ? t("health.tracking.detail") : t("health.unavailable")}
                icon="chart"
              />
            </section>

            <section
              aria-label={t("aria.websites")}
              className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-12"
            >
              <article className="rounded-panel border border-line-soft bg-[linear-gradient(160deg,rgba(255,255,255,0.036),rgba(255,255,255,0.01))] p-[18px] min-w-0 lg:col-span-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-medium tracking-[-0.02em] text-[#dededb]">
                      {site.businessName}
                    </h3>
                    <p className="mt-1 text-[11px] text-dim">
                      {t("panel.subtitle")}
                    </p>
                  </div>
                  <StatusChip status={site.status} label={t(`status.${site.status}`)} />
                </div>

                <div className="mt-4">
                  <MiniSiteSheet site={site} />
                </div>

                <dl className="mt-4 divide-y divide-white/[0.04]">
                  {[
                    {
                      label: t("rows.business"),
                      value: site.businessName,
                    },
                    {
                      label: t("rows.industry"),
                      value: site.industry,
                    },
                    {
                      label: t("rows.status"),
                      value: t(`status.${site.status}`),
                    },
                    {
                      label: t("rows.updated"),
                      value: formatDate(locale, site.updatedAt),
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-baseline justify-between gap-4 py-2.5"
                    >
                      <dt className="mono-label text-[11px] tracking-[0.11em] text-faint">
                        {row.label}
                      </dt>
                      <dd className="min-w-0 truncate text-end text-[11px] text-[#b4b4b9]">
                        {row.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line-soft pt-3.5">
                  <Link href={editHref} data-tour="dashboard-edit" className={buttonClass("primary", "sm", "px-4")}>
                    {t("action.edit")}
                  </Link>
                  <a
                    href={previewHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass("secondary", "sm", "gap-1.5 px-4")}
                  >
                    {t("action.preview")}
                    <Icon name="external" className="h-3 w-3" />
                  </a>
                  <span className="ms-auto">
                    <DeleteSiteButton siteId={site.id} />
                  </span>
                </div>
              </article>

              <RecentActivity items={activity} now={now} />
            </section>
          </>
        )}

      </main>
    </DashboardShell>
  );
}
