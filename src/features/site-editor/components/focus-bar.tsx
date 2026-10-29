"use client";

import { useTranslations } from "next-intl";
import { Icon } from "../../../shared/ui/icon";
import type { Locale } from "../../static-site-generator/locale";
import type { Page, SiteContent } from "../../static-site-generator/site-content";
import { sectionNav, visibleSections } from "../section-nav";

type FocusBarProps = {
  content: SiteContent;
  page: Page;
  locale: Locale;
  focusId: string | null;
  onBack: () => void;
  onSelectBlock: (blockId: string) => void;
  onSelectPage: (pageId: string) => void;
  onSelectLocale: (locale: Locale) => void;
};

const navButtonClass =
  "grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line text-soft transition-colors hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30";
const selectClass =
  "h-9 min-w-0 max-w-[180px] rounded-xl border border-line bg-surface px-3 text-xs text-ink outline-none focus:border-accent/45";

export function FocusBar({
  content,
  page,
  locale,
  focusId,
  onBack,
  onSelectBlock,
  onSelectPage,
  onSelectLocale,
}: FocusBarProps) {
  const t = useTranslations("editor");
  const sections = visibleSections(page.blocks);
  const nav = sectionNav(page.blocks, focusId);
  const focused = sections.find((block) => block.id === focusId) ?? null;

  return (
    <div className="shrink-0 border-b border-line bg-surface px-3 py-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-line px-3 text-xs text-soft transition-colors hover:bg-white/[0.06]"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180 rtl:rotate-0" />
            {t("focus.back")}
          </button>
          <select
            value={page.id}
            onChange={(event) => onSelectPage(event.target.value)}
            aria-label={t("panel.pagesTitle")}
            className={selectClass}
          >
            {content.pages.map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {t(`pages.${candidate.slug}`)}
              </option>
            ))}
          </select>
          {content.locales.length === 2 ? (
            <select
              value={locale}
              onChange={(event) => onSelectLocale(event.target.value as Locale)}
              aria-label={t("panel.languageLabel")}
              className={selectClass}
            >
              {content.locales.map((candidate) => (
                <option key={candidate} value={candidate}>
                  {t(`languages.${candidate}`)}
                </option>
              ))}
            </select>
          ) : null}
        </div>

        <div className="min-w-[180px] flex-1 text-center">
          {nav && focused ? (
            <p className="truncate text-sm text-ink">
              {t("canvas.focusTitle", {
                number: nav.number,
                total: nav.total,
                name: t(`blocks.${focused.type}`),
              })}
            </p>
          ) : null}
          <p className="truncate text-xs text-faint">{t("focus.hint")}</p>
        </div>

        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={() => nav?.prevId && onSelectBlock(nav.prevId)}
            disabled={!nav?.prevId}
            aria-label={t("canvas.previous")}
            title={t("canvas.previous")}
            className={navButtonClass}
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180 rtl:rotate-0" />
          </button>
          <select
            value={focusId ?? ""}
            onChange={(event) => onSelectBlock(event.target.value)}
            aria-label={t("panel.sections")}
            className={selectClass}
          >
            {sections.map((block, index) => (
              <option key={block.id} value={block.id}>
                {index + 1}. {t(`blocks.${block.type}`)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => nav?.nextId && onSelectBlock(nav.nextId)}
            disabled={!nav?.nextId}
            aria-label={t("canvas.next")}
            title={t("canvas.next")}
            className={navButtonClass}
          >
            <Icon name="arrow" className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
}
