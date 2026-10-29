import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { requirePageUser } from "@/features/auth/session";
import { getSite } from "@/features/site-creation/service";
import { SiteEditor } from "@/features/site-editor/components/site-editor";
import { Link } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

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

  if (!site.content) {
    const t = await getTranslations("editor.notReady");

    return (
      <main className="flex min-h-screen items-center justify-center px-5">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="font-display text-[clamp(24px,3vw,32px)] leading-tight font-light tracking-[-0.04em]">
            {t("title")}
          </h1>
          <p className="mt-3 text-xs leading-[1.65] text-muted">{t("body")}</p>
          <Link href="/dashboard" className={buttonClass("secondary", "md", "mt-6")}>
            {t("back")}
          </Link>
        </Card>
      </main>
    );
  }

  return <SiteEditor siteId={site.id} content={site.content} />;
}
