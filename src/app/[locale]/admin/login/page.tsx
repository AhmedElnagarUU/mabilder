import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ADMIN_LOGIN_DISABLED_MESSAGE, readAdminConfig } from "@/features/admin/auth/config";
import { AdminLoginForm } from "@/features/admin/components/login-form";
import { Logo } from "@/shared/ui/logo";

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
    <div className="relative min-h-screen">
      <div aria-hidden className="studio-grid pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10 flex min-h-screen flex-col px-4 sm:px-6">
        <header className="mx-auto flex h-16 w-full max-w-5xl items-center">
          <Logo />
        </header>

        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">
            <p className="eyebrow text-soft">Admin</p>
            <h1 className="mt-4 font-display text-[clamp(32px,4vw,44px)] leading-[1.02] font-normal tracking-[-0.05em]">
              Admin sign-in
            </h1>
            <p className="mt-3 text-[13px] leading-[1.65] text-muted">
              Owner access only. Sessions expire after 5 hours.
            </p>

            <div className="glass mt-8 rounded-[30px] p-5 sm:p-7">
              {readAdminConfig() ? (
                <AdminLoginForm />
              ) : (
                <p role="alert" className="text-sm leading-6 text-warn">
                  {ADMIN_LOGIN_DISABLED_MESSAGE}
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
