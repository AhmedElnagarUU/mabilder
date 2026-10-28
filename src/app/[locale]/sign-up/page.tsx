import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthPageShell } from "@/features/auth/components/auth-page-shell";
import { SignUpForm } from "@/features/auth/components/sign-up-form";
import { safeNextPath } from "@/features/auth/next-path";
import { Link } from "@/shared/i18n/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sign-up">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth.signUp" });

  return { title: t("metaTitle") };
}

export default async function SignUpPage({
  params,
  searchParams,
}: PageProps<"/[locale]/sign-up">) {
  const { locale } = await params;
  setRequestLocale(locale);

  const nextPath = safeNextPath((await searchParams).next);
  const t = await getTranslations("auth.signUp");

  return (
    <AuthPageShell
      eyebrow={t("eyebrow")}
      title={t("title")}
      intro={t("intro")}
      footer={
        <>
          {t("switchPrompt")}{" "}
          <Link
            href={{ pathname: "/sign-in", query: { next: nextPath } }}
            className="font-medium text-ink underline decoration-line underline-offset-4"
          >
            {t("switchLink")}
          </Link>
        </>
      }
    >
      <SignUpForm nextPath={nextPath} />
    </AuthPageShell>
  );
}
