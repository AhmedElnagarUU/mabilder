"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "@/features/static-site-generator/locale";
import type { PageSlug } from "@/features/static-site-generator/site-content";
import type { SeoPageMeta, SeoText } from "../types";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { inputClass, labelClass } from "@/shared/ui/field";

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
  const [saveState, setSaveState] = useState<SaveState>("idle");

  function changeText(pageId: string, locale: Locale, field: keyof SeoText, value: string) {
    setPages((current) =>
      current.map((page) =>
        page.id === pageId
          ? { ...page, meta: { ...page.meta, [locale]: editText(page.meta[locale], field, value) } }
          : page,
      ),
    );
    setSaveState("idle");
  }

  async function save() {
    setSaveState("saving");
    setSaveState(await sendSeo(siteId, pages));
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
      {pages.map((page) => (
        <PageSeoCard
          key={page.id}
          page={page}
          locales={locales}
          onChange={(locale, field, value) => changeText(page.id, locale, field, value)}
        />
      ))}

      <div className="flex flex-wrap items-center justify-end gap-3">
        <p
          role="status"
          className={`text-sm ${saveState === "invalid" || saveState === "failed" ? "text-danger" : "text-muted"}`}
        >
          {messages[saveState]}
        </p>
        <button
          type="button"
          onClick={save}
          disabled={saveState === "saving"}
          className={buttonClass("primary", "md")}
        >
          {t("save.button")}
        </button>
      </div>
    </div>
  );
}
