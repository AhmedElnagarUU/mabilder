import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/shared/i18n/navigation";

export default async function EditPage({ params }: PageProps<"/[locale]/edit">) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: "/dashboard", locale });
}
