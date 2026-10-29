import { getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";

export async function EditorUpgradeNotice({ siteId }: { siteId: string }) {
  const t = await getTranslations("editor.upgrade");

  return (
    <main className="flex flex-col items-center px-5 py-24 text-center">
      <div className="grid h-11 w-11 place-items-center rounded-full border border-accent/20 bg-accent/10 text-accent">
        <Icon name="pen" className="h-5 w-5" />
      </div>
      <h1 className="mt-5 font-display text-[clamp(26px,3vw,36px)] leading-none font-light tracking-[-0.04em]">
        {t("title")}
      </h1>
      <p className="mt-3 max-w-md text-xs leading-[1.65] text-muted">{t("body")}</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        <a
          href={`/preview/${siteId}/index.html`}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClass("primary", "md", "gap-2")}
        >
          {t("openPreview")}
          <Icon name="external" className="h-3.5 w-3.5" />
        </a>
        <Link href="/dashboard" className={buttonClass("secondary", "md")}>
          {t("backToDashboard")}
        </Link>
      </div>
    </main>
  );
}
