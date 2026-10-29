"use client";

import { useTranslations } from "next-intl";
import { Icon } from "../../../shared/ui/icon";
import type { Locale } from "../../static-site-generator/locale";
import type { Page, SiteContent } from "../../static-site-generator/site-content";
import { PanelToggle } from "./panel-toggle";

type PagePanelProps = {
  content: SiteContent;
  page: Page;
  locale: Locale;
  onSelectPage: (pageId: string) => void;
  onSelectLocale: (locale: Locale) => void;
  onCollapse: () => void;
};

export function PagePanel({
  content,
  page,
  locale,
  onSelectPage,
  onSelectLocale,
  onCollapse,
}: PagePanelProps) {
  const t = useTranslations("editor");

  return (
    <aside className="h-full w-[200px] shrink-0 space-y-5 overflow-y-auto border-s border-line bg-surface px-3 py-3">
      <section>
        <div className="mb-2 flex items-center gap-2">
          <PanelToggle direction="end" onClick={onCollapse} />
          <p className="mono-label truncate text-[13px] tracking-[0.12em] text-faint">
            {t("panel.pagesTitle")}
          </p>
        </div>
        <nav className="space-y-1">
          {content.pages.map((candidate) => {
            const active = candidate.id === page.id;

            return (
              <button
                key={candidate.id}
                type="button"
                onClick={() => onSelectPage(candidate.id)}
                aria-current={active ? "page" : undefined}
                className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-[15px] transition-colors ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-white/[0.04] hover:text-ink"
                }`}
              >
                <Icon name="pages" className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t(`pages.${candidate.slug}`)}</span>
              </button>
            );
          })}
        </nav>
      </section>

      {content.locales.length === 2 ? (
        <section>
          <p className="mono-label mb-2 text-[13px] tracking-[0.12em] text-faint">
            {t("panel.languageLabel")}
          </p>
          <div className="flex rounded-full border border-line bg-white/[0.025] p-0.5">
            {content.locales.map((candidate) => (
              <button
                key={candidate}
                type="button"
                onClick={() => onSelectLocale(candidate)}
                aria-pressed={candidate === locale}
                className={`flex-1 rounded-full px-2 py-1 text-sm transition-colors ${
                  candidate === locale
                    ? "bg-white/[0.1] text-ink"
                    : "text-muted hover:text-soft"
                }`}
              >
                {t(`languages.${candidate}`)}
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </aside>
  );
}
