import type { Metadata } from "next";
import { ContentEditor } from "@/features/static-site-generator/components/content-editor";

export const metadata: Metadata = {
  title: "Website editor",
  description: "Edit the generated website visually.",
};

export default async function EditSitePage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const { siteId } = await params;

  return <ContentEditor siteId={siteId} />;
}
