import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { requireAdminPage } from "@/features/admin/auth/guards";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { PaymentSettingsForm } from "@/features/admin/components/payment-settings-form";
import { getPaymentSettings, getProPriceEgp } from "@/features/billing/settings/service";

export const metadata: Metadata = {
  title: "Admin settings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage({
  params,
}: PageProps<"/[locale]/admin/settings">) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdminPage(locale);

  const settings = await getPaymentSettings();
  const price = getProPriceEgp();

  return (
    <AdminShell title="Settings">
      <p className="mb-6 text-sm text-muted">
        Pro price for wallet payments (read-only, set by PRO_PRICE_EGP):{" "}
        <span className="text-ink">{price === null ? "not set, so the wallet option is hidden" : `${price} EGP`}</span>
      </p>
      <PaymentSettingsForm initial={settings} />
    </AdminShell>
  );
}
