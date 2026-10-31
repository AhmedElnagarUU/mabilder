"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/features/static-site-generator/locale";
import type { PageSlug } from "@/features/static-site-generator/site-content";
import type { SeoPageMeta, SeoText } from "../types";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { inputClass, labelClass, SelectField } from "@/shared/ui/field";

const TITLE_AIM = 60;
const DESCRIPTION_AIM = 160;

export type SeoFormPage = { id: string; slug: PageSlug; meta: SeoPageMeta };

type SaveState = "idle" | "saving" | "saved" | "invalid" | "failed";

function editText(
  text: SeoText | undefined,
  field: keyof SeoText,
  value: string,
): SeoText {
  return { title: text?.title ?? "", description: text?.description ?? "", [field]: value };
}

function pagePath(slug: PageSlug): string {
  return slug === "index" ? "/" : `/${slug}`;
}

function sameText(left: SeoText | undefined, right: SeoText | undefined): boolean {
  return (
    (left?.title ?? "") === (right?.title ?? "") &&
    (left?.description ?? "") === (right?.description ?? "")
  );
}

function matchesSaved(
  page: SeoFormPage,
  savedPages: SeoFormPage[],
  locales: Locale[],
): boolean {
  const saved = savedPages.find((candidate) => candidate.id === page.id);

  if (!saved) {
    return false;
  }

  return locales.every((locale) => sameText(page.meta[locale], saved.meta[locale]));
}

function stateFor(response: Response): SaveState {
  if (response.ok) {
    return "saved";
  }

  return response.status === 400 ? "invalid" : "failed";
}

async function sendSeo(siteId: string, pages: SeoFormPage[]): Promise<SaveState> {
  try {
    const response = await fetch(`/api/sites/${siteId}/seo`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pages: pages.map(({ id, meta }) => ({ id, meta })) }),
    });

    return stateFor(response);
  } catch {
    return "failed";
  }
}

function Counter({ count, aim }: { count: number; aim: number }) {
  const t = useTranslations("seo");

  return (
    <span className={`text-sm tabular-nums ${count > aim ? "text-warn" : "text-faint"}`}>
      {t("counter", { count, aim })}
    </span>
  );
}

function SearchPreview({
  path,
  title,
  description,
  direction,
}: {
  path: string;
  title: string;
  description: string;
  direction: "ltr" | "rtl";
}) {
  const t = useTranslations("seo");

  return (
    <div
      role="group"
      aria-label={t("preview.label")}
      dir={direction}
      className="rounded-xl border border-line-soft bg-white/[0.02] p-4"
    >
      <p className="truncate text-sm text-faint">
        <bdi dir="ltr">{path}</bdi>
      </p>
      <p className="mt-1 truncate text-base text-accent">
        {title.trim() || t("preview.untitled")}
      </p>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}

function LocaleSeoFields({
  locale,
  text,
  path,
  onChange,
}: {
  locale: Locale;
  text: SeoText | undefined;
  path: string;
  onChange: (field: keyof SeoText, value: string) => void;
}) {
  const t = useTranslations("seo");
  const title = text?.title ?? "";
  const description = text?.description ?? "";
  const direction = locale === "ar" ? "rtl" : "ltr";

  return (
    <section className="flex flex-col gap-3">
      <h3 className="mono-label text-[11px] tracking-[0.12em] text-dim uppercase">
        {t(`languages.${locale}`)}
      </h3>

      <label className="block">
        <span className="flex items-baseline justify-between gap-3">
          <span className={labelClass}>{t("field.title")}</span>
          <Counter count={title.length} aim={TITLE_AIM} />
        </span>
        <input
          type="text"
          value={title}
          lang={locale}
          dir={direction}
          onChange={(event) => onChange("title", event.target.value)}
          className={inputClass}
        />
      </label>

      <label className="block">
        <span className="flex items-baseline justify-between gap-3">
          <span className={labelClass}>{t("field.description")}</span>
          <Counter count={description.length} aim={DESCRIPTION_AIM} />
        </span>
        <textarea
          value={description}
          lang={locale}
          dir={direction}
          rows={3}
          onChange={(event) => onChange("description", event.target.value)}
          className={`${inputClass} resize-y`}
        />
      </label>

      <SearchPreview
        path={path}
        title={title}
        description={description}
        direction={direction}
      />
    </section>
  );
}

function PageSeoCard({
  page,
  locales,
  onChange,
}: {
  page: SeoFormPage;
  locales: Locale[];
  onChange: (locale: Locale, field: keyof SeoText, value: string) => void;
}) {
  const pageName = useTranslations("editor.pages");

  return (
    <Card className="p-5">
      <h2 className="text-base font-medium text-ink">{pageName(page.slug)}</h2>

      <div className="mt-4 flex flex-col gap-6">
        {locales.map((locale) => (
          <LocaleSeoFields
            key={locale}
            locale={locale}
            text={page.meta[locale]}
            path={pagePath(page.slug)}
            onChange={(field, value) => onChange(locale, field, value)}
          />
        ))}
      </div>
    </Card>
  );
}

function PagePicker({
  pages,
  activePageId,
  onSelect,
}: {
  pages: SeoFormPage[];
  activePageId: string;
  onSelect: (pageId: string) => void;
}) {
  const t = useTranslations("seo");
  const pageName = useTranslations("editor.pages");

  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        aria-label={t("pagePicker.label")}
        className="hidden flex-wrap gap-2 sm:flex"
      >
        {pages.map((page) => {
          const active = page.id === activePageId;

          return (
            <button
              key={page.id}
              type="button"
              aria-pressed={active}
              onClick={() => onSelect(page.id)}
              className={`h-9 rounded-full border px-4 text-sm font-medium transition-colors ${
                active
                  ? "border-accent/45 bg-accent/10 text-accent"
                  : "border-line bg-white/[0.03] text-muted hover:bg-white/[0.06] hover:text-ink"
              }`}
            >
              {pageName(page.slug)}
            </button>
          );
        })}
      </div>

      <div className="sm:hidden">
        <SelectField
          label={t("pagePicker.label")}
          value={activePageId}
          onChange={onSelect}
          options={pages.map((page) => ({
            value: page.id,
            label: pageName(page.slug),
          }))}
        />
      </div>
    </div>
  );
}

export function SeoForm({
  siteId,
  locales,
  pages: initialPages,
}: {
  siteId: string;
  locales: Locale[];
  pages: SeoFormPage[];
}) {
  const t = useTranslations("seo");
  const [pages, setPages] = useState(initialPages);
  const [savedPages, setSavedPages] = useState(initialPages);
  const [activePageId, setActivePageId] = useState(initialPages[0]?.id ?? "");
  const [pendingPageId, setPendingPageId] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0];
  const dirty = activePage ? !matchesSaved(activePage, savedPages, locales) : false;

  useEffect(() => {
    if (!dirty) {
      return;
    }

    function warnBeforeLeave(event: BeforeUnloadEvent): void {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeLeave);

    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeave);
    };
  }, [dirty]);

  function switchPage(pageId: string): void {
    setActivePageId(pageId);
    setPendingPageId(null);
  }

  function requestPage(pageId: string): void {
    if (pageId === activePageId) {
      return;
    }

    if (dirty) {
      setPendingPageId(pageId);
      return;
    }

    switchPage(pageId);
    setSaveState("idle");
  }

  function changeText(locale: Locale, field: keyof SeoText, value: string): void {
    if (!activePage) {
      return;
    }

    setPages((current) =>
      current.map((page) =>
        page.id === activePage.id
          ? { ...page, meta: { ...page.meta, [locale]: editText(page.meta[locale], field, value) } }
          : page,
      ),
    );
    setSaveState("idle");
  }

  async function save(): Promise<boolean> {
    setSaveState("saving");

    const state = await sendSeo(siteId, pages);
    setSaveState(state);

    if (state === "saved") {
      setSavedPages(pages);
      return true;
    }

    return false;
  }

  async function saveAndSwitch(): Promise<void> {
    const target = pendingPageId;
    const ok = await save();

    if (ok && target) {
      switchPage(target);
      return;
    }

    setPendingPageId(null);
  }

  function discardAndSwitch(): void {
    const target = pendingPageId;

    if (!target || !activePage) {
      return;
    }

    setPages((current) =>
      current.map((page) => {
        if (page.id !== activePage.id) {
          return page;
        }

        const saved = savedPages.find((candidate) => candidate.id === page.id);
        return saved ? { ...page, meta: saved.meta } : page;
      }),
    );
    switchPage(target);
    setSaveState("idle");
  }

  const messages: Record<SaveState, string> = {
    idle: "",
    saving: t("save.saving"),
    saved: t("save.saved"),
    invalid: t("errors.invalid"),
    failed: t("errors.failed"),
  };

  return (
    <div className="flex flex-col gap-4">
      {activePage ? (
        <>
          <PagePicker pages={pages} activePageId={activePage.id} onSelect={requestPage} />
          <div data-tour="seo-page">
            <PageSeoCard
              page={activePage}
              locales={locales}
              onChange={(locale, field, value) => changeText(locale, field, value)}
            />
          </div>
        </>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <p
          role="status"
          className={`text-sm ${saveState === "invalid" || saveState === "failed" ? "text-danger" : "text-muted"}`}
        >
          {messages[saveState]}
        </p>
        <button
          type="button"
          onClick={() => void save()}
          data-tour="seo-save"
          disabled={saveState === "saving"}
          className={buttonClass("primary", "md")}
        >
          {t("save.button")}
        </button>
      </div>

      {pendingPageId ? (
        <ConfirmDialog
          title={t("confirm.title")}
          description={t("confirm.body")}
          confirmLabel={t("confirm.save")}
          cancelLabel={t("confirm.discard")}
          busy={saveState === "saving"}
          onConfirm={() => void saveAndSwitch()}
          onCancel={discardAndSwitch}
          onDismiss={() => setPendingPageId(null)}
        />
      ) : null}
    </div>
  );
}
