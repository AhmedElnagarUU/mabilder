import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ContentEditor } from "@/features/static-site-generator/components/content-editor";

export const metadata: Metadata = {
  title: "Website editor",
  description: "Edit the generated website visually.",
};

export default async function EditSitePage({
  params,
}: PageProps<"/[locale]/edit/[siteId]">) {
  const { locale, siteId } = await params;
  setRequestLocale(locale);

  return <ContentEditor siteId={siteId} />;
}
