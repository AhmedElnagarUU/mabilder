import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requirePageUser } from "@/features/auth/session";
import { DashboardShell } from "@/features/site-creation/components/dashboard-shell";
import { getSite, listSites } from "@/features/site-creation/service";
import { TrackingForm } from "@/features/tracking/components/tracking-form";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/tracking">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tracking.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export const dynamic = "force-dynamic";

export default async function TrackingPage({
  params,
}: PageProps<"/[locale]/dashboard/tracking">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requirePageUser(locale, "/dashboard/tracking");
  const t = await getTranslations("tracking");

  const summary = (await listSites(user.id))[0] ?? null;
  const site = summary ? await getSite(user.id, summary.id) : null;

  return (
    <DashboardShell user={user} site={site} crumbLabel={t("title")}>
      <main className="pt-7 pb-6">
        <h1 className="font-display text-[clamp(24px,2.4vw,29px)] leading-[1.05] font-light tracking-[-0.045em] text-[#f1f1ee]">
          {t("title")}
        </h1>
        {site ? (
          <>
            <p className="mt-2 max-w-2xl text-base text-dim">{t("subtitle")}</p>
            <TrackingForm siteId={site.id} initial={site.tracking} />
          </>
        ) : (
          <p className="mt-2 text-base text-dim">{t("noSite")}</p>
        )}
      </main>
    </DashboardShell>
  );
}
