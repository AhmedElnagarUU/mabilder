import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requirePageUser } from "@/features/auth/session";
import { ProjectList } from "@/features/projects/components/project-list";
import { getProjectsOverview, type ProjectsOverview } from "@/features/projects/service";
import { DashboardShell } from "@/features/site-creation/components/dashboard-shell";
import { Link } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/projects">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export const dynamic = "force-dynamic";

export default async function ProjectsPage({
  params,
}: PageProps<"/[locale]/dashboard/projects">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requirePageUser(locale, "/dashboard/projects");
  const t = await getTranslations("projects");

  let overview: ProjectsOverview | null = null;
  let loadFailed = false;

  try {
    overview = await getProjectsOverview(user.id);
  } catch (error) {
    console.error(error);
    loadFailed = true;
  }

  return (
    <DashboardShell
      user={user}
      site={overview ? { id: overview.site.siteId } : null}
      crumbLabel={t("breadcrumb")}
      active="projects"
    >
      <main className="pt-7">
        <h1 className="font-display text-[clamp(24px,2.4vw,29px)] leading-[1.05] font-light tracking-[-0.045em] text-[#f1f1ee]">
          {t("title")}
        </h1>
        <p className="mt-2 mb-6 text-base text-dim">{t("subtitle")}</p>

        {loadFailed ? (
          <div className="rounded-panel border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
            {t("errors.default")}
          </div>
        ) : overview ? (
          <ProjectList site={overview.site} projects={overview.projects} />
        ) : (
          <div className="rounded-panel border border-line-soft px-6 py-12 text-center">
            <p className="text-base text-muted">{t("noSite")}</p>
            <Link href="/dashboard/new" className={buttonClass("primary", "md", "mt-6")}>
              {t("noSiteCta")}
            </Link>
          </div>
        )}
      </main>
    </DashboardShell>
  );
}
