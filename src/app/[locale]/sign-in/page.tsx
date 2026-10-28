import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import { SignInForm } from "@/features/auth/components/sign-in-form";
import { safeNextPath } from "@/features/auth/next-path";
import { Link } from "@/shared/i18n/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sign-in">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.signIn" });

  return { title: t("metaTitle") };
}

export default async function SignInPage({
  params,
  searchParams,
}: PageProps<"/[locale]/sign-in">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const nextPath = safeNextPath((await searchParams).next);
  const t = await getTranslations("auth.signIn");

  return (
    <AuthPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      intro={t("intro")}
      footer={
        <>
          {t("switchPrompt")}{" "}
          <Link
            href={{ pathname: "/sign-up", query: { next: nextPath } }}
            className="font-medium text-ink underline decoration-line underline-offset-4"
          >
            {t("switchLink")}
          </Link>
        </>
      }
    >
      <SignInForm nextPath={nextPath} />
    </AuthPageShell>
  );
}
