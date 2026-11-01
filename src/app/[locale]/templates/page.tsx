import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { routing } from "@/shared/i18n/routing";
import { TemplatesGallery } from "@/features/templates-gallery/components/templates-gallery";
import { TemplatesHeader } from "@/features/templates-gallery/components/templates-header";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/templates">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "templatesGallery.meta" });

  return { title: t("title"), description: t("description") };
}

export default async function TemplatesPage({ params }: PageProps<"/[locale]/templates">) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <div className="flex min-h-full flex-1">
      <TemplatesHeader />
      <TemplatesGallery locale={locale} />
    </div>
  );
}
