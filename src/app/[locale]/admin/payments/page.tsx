import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/features/admin/auth/guards";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { PaymentsFilters, PaymentsTable } from "@/features/admin/components/payments-table";
import { listAdminPayments } from "@/features/admin/payments";
import { paymentListQuerySchema } from "@/features/billing/payments/types";

export const metadata: Metadata = {
  title: "Admin payments",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPaymentsPage({
  params,
  searchParams,
}: PageProps<"/[locale]/admin/payments">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);

  const { status } = await searchParams;
  const query = paymentListQuerySchema.parse({ status: Array.isArray(status) ? status[0] : status });

  return (
    <AdminShell title="Payments">
      <PaymentsFilters query={query} />
      <PaymentsTable payments={await listAdminPayments(query)} />
    </AdminShell>
  );
}
