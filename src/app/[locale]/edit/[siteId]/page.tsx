import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requirePageUser } from "@/features/auth/session";
import { DashboardShell } from "@/features/site-creation/components/dashboard-shell";
import { EditorUpgradeNotice } from "@/features/site-creation/components/editor-upgrade-notice";
import { getSite } from "@/features/site-creation/service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/edit/[siteId]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "editor.meta" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function EditSitePage({
  params,
}: PageProps<"/[locale]/edit/[siteId]">) {
  const { locale, siteId } = await params;
  setRequestLocale(locale);

  const user = await requirePageUser(locale, `/edit/${siteId}`);
  const site = await getSite(user.id, siteId);

  if (!site) {
    notFound();
  }

  const t = await getTranslations("editor.meta");

  return (
    <DashboardShell user={user} site={site} crumbLabel={t("title")}>
      <EditorUpgradeNotice siteId={site.id} />
    </DashboardShell>
  );
}
