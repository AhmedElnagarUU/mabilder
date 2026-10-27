import type { Metadata } from "next";
import Link from "next/link";
import { DashboardShell } from "@/features/site-creation/components/dashboard-shell";
import { DeleteSiteButton } from "@/features/site-creation/components/delete-site-button";
import { listSites } from "@/features/site-creation/service";
import type { SiteSummary } from "@/features/site-creation/types";
import { buttonClass } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Create and manage the websites in your studio.",
};

export const dynamic = "force-dynamic";

const statusStyles: Record<SiteSummary["status"], string> = {
  draft: "border-line text-muted",
  generating: "border-warn/25 text-warn",
  ready: "border-ink/25 text-ink",
  error: "border-danger/20 text-danger",
};

const statusDots: Record<SiteSummary["status"], string> = {
  draft: "bg-faint",
  generating: "bg-warn",
  ready: "bg-ink",
  error: "bg-danger",
};

const statusLabels: Record<SiteSummary["status"], string> = {
  draft: "Draft",
  generating: "Generating",
  ready: "Ready",
  error: "Needs attention",
};

const covers = [
  {
    background:
      "linear-gradient(150deg, #f6fcfb 0%, #dcf6f3 58%, #b4ece6 100%)",
    ink: "#073437",
  },
  {
    background:
      "linear-gradient(150deg, #0a5b5c 0%, #044144 55%, #032b2e 100%)",
    ink: "#f2fdfb",
  },
  {
    background:
      "linear-gradient(150deg, #eefaf8 0%, #d3eeea 55%, #aedcd7 100%)",
    ink: "#164a4c",
  },
  {
    background:
      "linear-gradient(150deg, #e0f4f1 0%, #c6e6e2 55%, #9fcdc8 100%)",
    ink: "#0b3f42",
  },
];

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function initialOf(name: string): string {
  return (name.trim()[0] ?? "W").toUpperCase();
}

function StatusChip({ status }: { status: SiteSummary["status"] }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded border px-2 py-1 font-mono text-[7px] tracking-[0.08em] uppercase ${statusStyles[status]}`}
    >
      <i
        className={`h-[4px] w-[4px] rounded-full ${statusDots[status]} ${
          status === "generating" ? "animate-pulse" : ""
        }`}
      />
      {statusLabels[status]}
    </span>
  );
}

function Kpi({
  label,
  value,
  detail,
  note,
  dark = false,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  note: string;
  dark?: boolean;
  icon: "grid" | "check" | "clock" | "shield";
}) {
  return (
    <article
      className={`relative flex min-h-[126px] flex-col overflow-hidden rounded-[18px] p-[17px_18px] ${
        dark
          ? "border border-white/12 bg-[linear-gradient(160deg,#0a5b5c,#032b2e)] text-white shadow-[0_24px_60px_-30px_rgba(2,38,41,0.42)]"
          : "glass"
      }`}
    >
      {dark ? (
        <span
          aria-hidden
          className="absolute -top-10 -right-8 h-[120px] w-[120px] rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.13),transparent)]"
        />
      ) : null}

      <div className="flex items-center justify-between">
        <span
          className={`mono-label text-[7.5px] tracking-[0.12em] ${
            dark ? "text-white/40" : "text-faint"
          }`}
        >
          {label}
        </span>
        <Icon
          name={icon}
          className={`h-[13px] w-[13px] ${dark ? "text-white/40" : "text-faint"}`}
        />
      </div>

      <b
        className={`mt-auto font-display text-[clamp(26px,2.5vw,34px)] leading-none font-normal tracking-[-0.055em] ${
          dark ? "text-white" : "text-ink"
        }`}
      >
        {value}
      </b>

      <div
        className={`mt-2.5 flex items-center justify-between font-mono text-[7px] tracking-[0.03em] ${
          dark ? "text-white/40" : "text-faint"
        }`}
      >
        <span>{detail}</span>
        <em
          className={`font-normal not-italic ${
            dark ? "text-white/80" : "text-soft"
          }`}
        >
          {note}
        </em>
      </div>
    </article>
  );
}

export default async function DashboardPage() {
  let sites: SiteSummary[] = [];
  let loadFailed = false;

  try {
    sites = await listSites();
  } catch (error) {
    console.error(error);
    loadFailed = true;
  }

  const readyCount = sites.filter((site) => site.status === "ready").length;
  const attentionCount = sites.filter((site) => site.status === "error").length;
  const inProgressCount = sites.filter(
    (site) => site.status === "draft" || site.status === "generating",
  ).length;

  return (
    <DashboardShell>
      <main>
        <div className="flex items-center gap-4 py-2 pb-6">
          <p className="mono-label flex items-center gap-2 text-[8px] tracking-[0.08em] text-faint">
            <b className="font-medium text-soft">Website Studio</b>
            <Icon name="chevron" className="h-2 w-2 -rotate-90" />
            Overview
          </p>
          <div className="ms-auto flex items-center gap-2">
            <span className="hidden h-9 items-center gap-1.5 rounded-full border border-line bg-white/55 px-3 font-mono text-[8px] tracking-[0.06em] text-soft shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] sm:flex">
              <i className="h-[4px] w-[4px] rounded-full bg-ink" />
              {sites.length} {sites.length === 1 ? "site" : "sites"}
            </span>
            <Link
              href="/dashboard/new"
              className={buttonClass("primary", "sm", "gap-1.5 px-4")}
            >
              <Icon name="plus" className="h-3.5 w-3.5" />
              New website
            </Link>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-[clamp(32px,3.5vw,46px)] leading-none font-normal tracking-[-0.055em]">
              Your websites<span className="text-accent">.</span>
            </h1>
            <p className="mt-2.5 text-[11.5px] text-muted">
              Open a site to refine its copy and images, or start a new brief
              from scratch.
            </p>
          </div>
          <p className="mono-label hidden text-[7.5px] tracking-[0.1em] text-faint lg:block">
            Six pages per brief / one calm editor
          </p>
        </div>

        {loadFailed ? (
          <p className="rounded-[18px] border border-danger/20 bg-danger-soft px-4 py-3 text-xs text-danger">
            Could not load saved websites. Check the database connection and
            reload the page.
          </p>
        ) : null}

        {!loadFailed ? (
          <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Kpi
              label="Total websites"
              value={sites.length}
              detail="Across the studio"
              note="All time"
              icon="grid"
              dark
            />
            <Kpi
              label="Ready"
              value={readyCount}
              detail="Preview available"
              note="Live static"
              icon="check"
            />
            <Kpi
              label="In progress"
              value={inProgressCount}
              detail="Draft or generating"
              note="Working"
              icon="clock"
            />
            <Kpi
              label="Needs attention"
              value={attentionCount}
              detail="Failed generation"
              note={attentionCount > 0 ? "Review" : "All clear"}
              icon="shield"
            />
          </section>
        ) : null}

        {!loadFailed && sites.length === 0 ? (
          <section className="glass mt-4 rounded-[26px] px-6 py-20 text-center">
            <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-accent text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]">
              <Icon name="pages" className="h-5 w-5" />
            </div>
            <p className="mono-label mt-5 text-[8px] tracking-[0.12em] text-faint">
              The studio is quiet
            </p>
            <h2 className="mt-3 font-display text-[clamp(28px,3vw,38px)] leading-none font-normal tracking-[-0.05em]">
              No websites yet.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-xs leading-[1.65] text-muted">
              Start with a short brief. The first draft of all six pages will be
              ready in a few minutes.
            </p>
            <Link
              href="/dashboard/new"
              className={buttonClass("primary", "md", "mt-7 gap-2")}
            >
              Create your first website
              <Icon name="arrow" className="h-3.5 w-3.5" />
            </Link>
          </section>
        ) : null}

        {sites.length > 0 ? (
          <section aria-label="Your websites" className="mt-8">
            <div className="mb-3.5 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-base font-medium tracking-[-0.035em]">
                  Recent websites
                </h2>
                <p className="mono-label mt-1 text-[7px] tracking-[0.05em] text-faint">
                  {sites.length} {sites.length === 1 ? "site" : "sites"} in the
                  studio
                </p>
              </div>
              <Link
                href="/dashboard/new"
                className="flex items-center gap-1 font-mono text-[7px] tracking-[0.08em] text-faint uppercase transition-colors hover:text-ink"
              >
                Start another
                <Icon name="arrow" className="h-2.5 w-2.5" />
              </Link>
            </div>

            <div className="grid gap-3.5 md:grid-cols-2">
              {sites.map((site, index) => {
                const cover = covers[index % covers.length];

                return (
                  <article
                    key={site.id}
                    className="glass group overflow-hidden rounded-[22px] transition-transform duration-300 hover:-translate-y-0.5"
                  >
                    <Link
                      href={`/edit/${site.id}`}
                      aria-label={`Edit ${site.businessName}`}
                      className="block overflow-hidden border-b border-white/50"
                    >
                      <div
                        className="relative h-[150px] sm:h-[164px]"
                        style={{ backgroundImage: cover.background }}
                      >
                        <div className="flex h-8 items-center gap-1.5 border-b border-black/5 bg-white/25 px-3.5">
                          <i className="h-[5px] w-[5px] rounded-full bg-black/20" />
                          <i className="h-[5px] w-[5px] rounded-full bg-black/20" />
                          <i className="h-[5px] w-[5px] rounded-full bg-black/20" />
                          <span className="ms-auto font-mono text-[6.5px] tracking-[0.06em] text-black/35">
                            /{site.slug}
                          </span>
                        </div>

                        <span
                          aria-hidden
                          className="absolute -top-16 -right-10 h-48 w-48 rounded-full border border-black/8"
                        />
                        <span
                          aria-hidden
                          className="absolute -top-8 -right-2 h-32 w-32 rounded-full border border-black/8"
                        />

                        <span
                          className="absolute bottom-3 left-5 font-display text-[76px] leading-none font-normal tracking-[-0.08em] sm:text-[84px]"
                          style={{ color: cover.ink }}
                        >
                          {initialOf(site.businessName)}
                        </span>

                        <span
                          className="mono-label absolute top-12 left-5 text-[7px] tracking-[0.12em]"
                          style={{ color: cover.ink, opacity: 0.55 }}
                        >
                          {String(index + 1).padStart(2, "0")} /{" "}
                          {site.industry}
                        </span>

                        <span
                          className="absolute right-5 bottom-5 font-mono text-[7px] tracking-[0.1em] uppercase"
                          style={{ color: cover.ink, opacity: 0.45 }}
                        >
                          Six pages
                        </span>
                      </div>
                    </Link>

                    <div className="p-[18px]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate font-display text-[17px] font-medium tracking-[-0.035em]">
                            {site.businessName}
                          </h3>
                          <p className="mono-label mt-1 text-[6.5px] tracking-[0.05em] text-faint">
                            Updated {formatDate(site.updatedAt)}
                          </p>
                        </div>
                        <StatusChip status={site.status} />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
                        <Link
                          href={`/edit/${site.id}`}
                          className={buttonClass("primary", "sm", "px-3.5")}
                        >
                          Edit
                        </Link>
                        <a
                          href={`/preview/${site.id}/index.html`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={buttonClass("secondary", "sm", "px-3.5 gap-1.5")}
                        >
                          Preview
                          <Icon name="external" className="h-3 w-3" />
                        </a>
                        <span className="ms-auto">
                          <DeleteSiteButton siteId={site.id} />
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}
      </main>
    </DashboardShell>
  );
}
