import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requirePageUser } from "@/features/auth/session";
import { DashboardShell } from "@/features/site-creation/components/dashboard-shell";
import { CreateSiteWizard } from "@/features/site-creation/components/create-site-wizard";
import { listSites } from "@/features/site-creation/service";
import { redirect } from "@/shared/i18n/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/new">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "siteCreation.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function NewSitePage({
  params,
}: PageProps<"/[locale]/dashboard/new">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requirePageUser(locale, "/dashboard/new");

  if ((await listSites(user.id)).length > 0) {
    redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations("siteCreation.meta");

  return (
    <DashboardShell user={user} site={null} crumbLabel={t("title")}>
      <CreateSiteWizard />
    </DashboardShell>
  );
}
