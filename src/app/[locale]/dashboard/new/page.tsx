import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CreateSiteWizard } from "@/features/site-creation/components/create-site-wizard";

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

  return <CreateSiteWizard />;
}
