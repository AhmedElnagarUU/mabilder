import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/features/admin/auth/guards";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { UserDetailView } from "@/features/admin/components/user-detail-view";
import { getUserDetail } from "@/features/admin/service";

export const metadata: Metadata = {
  title: "Admin user",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminUserPage({
  params,
}: PageProps<"/[locale]/admin/users/[userId]">) {
  const { locale, userId } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);

  const detail = await getUserDetail(userId);

  if (!detail) {
    notFound();
  }

  return (
    <AdminShell title={detail.user.name || detail.user.email} active="users">
      <UserDetailView detail={detail} />
    </AdminShell>
  );
}
