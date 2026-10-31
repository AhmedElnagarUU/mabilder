import { getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

export async function InboxLocked({ newCount }: { newCount: number }) {
  const t = await getTranslations("inbox.locked");

  return (
    <Card className="max-w-2xl px-6 py-10 text-center">
      <p className="font-display text-4xl font-light text-ink">{newCount}</p>
      <h2 className="mt-3 text-base font-medium text-ink">{t("title", { count: newCount })}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-muted">{t("body")}</p>
      <Link href="/billing" className={buttonClass("primary", "md", "mt-6")}>
        {t("cta")}
      </Link>
    </Card>
  );
}
