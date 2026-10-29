import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/features/admin/auth/guards";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { OverviewCards } from "@/features/admin/components/overview-cards";
import { getOverview } from "@/features/admin/service";

export const metadata: Metadata = {
  title: "Admin overview",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage({
  params,
}: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);

  return (
    <AdminShell title="Overview">
      <OverviewCards stats={await getOverview()} />
    </AdminShell>
  );
}
