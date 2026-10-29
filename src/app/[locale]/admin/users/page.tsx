import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/features/admin/auth/guards";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { UsersFilters, UsersTable } from "@/features/admin/components/users-table";
import { listUsers } from "@/features/admin/service";
import { userListQuerySchema } from "@/features/admin/types";

export const metadata: Metadata = {
  title: "Admin users",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function firstValues(searchParams: Record<string, string | string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(searchParams).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value]),
  );
}

export default async function AdminUsersPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/users">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);

  const query = userListQuerySchema.parse(firstValues(await searchParams));

  return (
    <AdminShell title="Users">
      <UsersFilters query={query} />
      <UsersTable users={await listUsers(query)} query={query} />
    </AdminShell>
  );
}
