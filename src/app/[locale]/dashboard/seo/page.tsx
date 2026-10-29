import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requirePageUser } from "@/features/auth/session";
import { SeoForm } from "@/features/seo/components/seo-form";
import { DashboardShell } from "@/features/site-creation/components/dashboard-shell";
import { getSite, listSites } from "@/features/site-creation/service";
import type { SiteRecord } from "@/features/site-creation/types";
import { Link } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/seo">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export const dynamic = "force-dynamic";

async function loadSite(userId: string): Promise<SiteRecord | null> {
  const [summary] = await listSites(userId);
  return summary ? getSite(userId, summary.id) : null;
}

export default async function SeoPage({
  params,
}: PageProps<"/[locale]/dashboard/seo">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requirePageUser(locale, "/dashboard/seo");
  const t = await getTranslations("seo");
  const site = await loadSite(user.id);
  const content = site?.content;

  if (!site || !content) {
    const notReady = await getTranslations("seo.notReady");

    return (
      <DashboardShell user={user} site={site} crumbLabel={t("navLabel")} active="seo">
        <main className="flex min-h-[60vh] items-center justify-center pt-10">
          <Card className="w-full max-w-md p-8 text-center">
            <h1 className="font-display text-[clamp(24px,3vw,32px)] leading-tight font-light tracking-[-0.04em]">
              {notReady("title")}
            </h1>
            <p className="mt-3 text-sm leading-[1.65] text-muted">{notReady("body")}</p>
            <Link href="/dashboard" className={buttonClass("secondary", "md", "mt-6")}>
              {notReady("back")}
            </Link>
          </Card>
        </main>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell user={user} site={site} crumbLabel={t("navLabel")} active="seo">
      <main className="pt-7 pb-6">
        <div className="mb-6">
          <h1 className="font-display text-[clamp(24px,2.4vw,29px)] leading-[1.05] font-light tracking-[-0.045em] text-[#f1f1ee]">
            {t("heading")}
          </h1>
          <p className="mt-2 text-sm text-dim">{t("subtitle")}</p>
        </div>
        <SeoForm siteId={site.id} locales={content.locales} pages={content.pages} />
      </main>
    </DashboardShell>
  );
}
