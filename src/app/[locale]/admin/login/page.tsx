import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ADMIN_LOGIN_DISABLED_MESSAGE, readAdminConfig } from "@/features/admin/auth/config";
import { AdminLoginForm } from "@/features/admin/components/login-form";
import { Card } from "@/shared/ui/card";

export const metadata: Metadata = {
  title: "Admin sign-in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({
  params,
}: PageProps<"/[locale]/admin/login">) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-canvas p-6">
      <Card className="w-full max-w-sm p-8">
        <h1 className="mb-6 text-2xl font-semibold text-ink">Admin sign-in</h1>
        {readAdminConfig() ? (
          <AdminLoginForm />
        ) : (
          <p role="alert" className="text-sm leading-6 text-warn">
            {ADMIN_LOGIN_DISABLED_MESSAGE}
          </p>
        )}
      </Card>
    </div>
  );
}
