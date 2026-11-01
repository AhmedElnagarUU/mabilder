import { getTranslations } from "next-intl/server";
import { LocaleSwitcher } from "@/shared/i18n/locale-switcher";
import { Link } from "@/shared/i18n/navigation";
import { Logo } from "@/shared/ui/logo";

export async function TemplatesHeader() {
  const t = await getTranslations("templatesGallery.header");

  return (
    <header className="sticky top-0 z-40 border-b border-line-soft bg-canvas/80 backdrop-blur-xl">
      <nav
        aria-label={t("aria")}
        className="mx-auto flex h-16 w-[min(1180px,calc(100%-40px))] items-center justify-between gap-4"
      >
        <Logo />
        <div className="flex items-center gap-2.5">
          <LocaleSwitcher className="inline-flex h-9 items-center rounded-full border border-line px-4 text-[12px] text-soft transition-colors hover:border-white/20 hover:text-ink" />
          <Link
            href="/"
            className="inline-flex h-9 items-center rounded-full border border-line px-4 text-[12px] text-soft transition-colors hover:border-white/20 hover:text-ink"
          >
            {t("home")}
          </Link>
        </div>
      </nav>
    </header>
  );
}
