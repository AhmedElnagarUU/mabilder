import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requirePageUser } from "@/features/auth/session";
import { DashboardShell } from "@/features/site-creation/components/dashboard-shell";
import { getSite } from "@/features/site-creation/service";
import { ChooseTemplate } from "@/features/site-editor/components/choose-template";
import { localeSchema } from "@/features/static-site-generator/locale";
import { buildTemplateChoices } from "@/features/templates-gallery/template-choices";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/dashboard/sites/[siteId]/template">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "templatePicker.meta" });

  return { title: t("title"), description: t("description") };
}

export default async function ChooseTemplatePage({
  params,
}: PageProps<"/[locale]/dashboard/sites/[siteId]/template">) {
  const { locale, siteId } = await params;
  setRequestLocale(locale);

  const user = await requirePageUser(locale, `/dashboard/sites/${siteId}/template`);
  const site = await getSite(user.id, siteId);
  const uiLocale = localeSchema.safeParse(locale);

  if (!site?.content || !uiLocale.success) {
    notFound();
  }

  const t = await getTranslations("templatePicker.page");

  return (
    <DashboardShell user={user} site={site} crumbLabel={t("crumb")}>
      <main className="pt-7 pb-10">
        <header className="mb-6 max-w-2xl">
          <h1 className="font-display text-[clamp(24px,2.4vw,29px)] leading-[1.05] font-light tracking-[-0.045em] text-[#f1f1ee]">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm text-dim">{t("subtitle")}</p>
        </header>
        <ChooseTemplate
          siteId={site.id}
          choices={buildTemplateChoices(uiLocale.data)}
          currentId={site.content.theme}
        />
      </main>
    </DashboardShell>
  );
}
