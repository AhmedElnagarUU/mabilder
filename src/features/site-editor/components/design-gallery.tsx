"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "../../../shared/ui/button";
import { Icon } from "../../../shared/ui/icon";
import type { Block } from "../../static-site-generator/blocks/catalog";
import type { Locale } from "../../static-site-generator/locale";
import type { SiteContent } from "../../static-site-generator/site-content";
import { currentDesignId, designsForBlock } from "../block-designs";
import { DesignPreviewFrame } from "./design-preview-frame";

type DesignGalleryProps = {
  content: SiteContent;
  siteId: string;
  pageId: string;
  block: Block;
  locale: Locale;
  onApply: (designId: string) => void;
  onClose: () => void;
};

const focusableSelector = "button:not([disabled]), [href], [tabindex]:not([tabindex='-1'])";

function trapTab(event: KeyboardEvent, dialog: HTMLElement): void {
  const items = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));

  if (items.length === 0) {
    return;
  }

  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  } else if (!dialog.contains(active)) {
    event.preventDefault();
    first.focus();
  }
}

export function DesignGallery({
  content,
  siteId,
  pageId,
  block,
  locale,
  onApply,
  onClose,
}: DesignGalleryProps) {
  const t = useTranslations("editor");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const current = currentDesignId(block);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    return () => opener?.focus();
  }, []);

  useEffect(() => {
    function handleKey(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "Tab" && dialogRef.current) {
        trapTab(event, dialogRef.current);
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  function designLabel(category: string, name: string, fallback: string): string {
    const key = `designs.labels.${category}-${name}`;
    return t.has(key) ? t(key) : fallback;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-3 sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="design-gallery-title"
        className="flex max-h-full w-full max-w-4xl flex-col rounded-panel border border-line bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line p-4 sm:p-5">
          <div className="min-w-0">
            <h2 id="design-gallery-title" className="text-lg font-semibold text-ink">
              {t("designs.title", { name: t(`blocks.${block.type}`) })}
            </h2>
            <p className="mt-1 text-[15px] text-muted">{t("designs.hint")}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("designs.close")}
            title={t("designs.close")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.08] hover:text-ink"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>

        <ul className="grid gap-4 overflow-y-auto p-4 sm:grid-cols-2 sm:p-5">
          {designsForBlock(block).map((design) => {
            const label = designLabel(design.category, design.name, design.label);
            const isCurrent = design.id === current;

            return (
              <li
                key={design.id}
                className={`flex flex-col gap-3 rounded-xl border p-3 ${
                  isCurrent ? "border-accent/60 bg-accent/5" : "border-line"
                }`}
              >
                <DesignPreviewFrame
                  content={content}
                  siteId={siteId}
                  pageId={pageId}
                  blockId={block.id}
                  designId={design.id}
                  locale={locale}
                  title={t("designs.previewLabel", { design: label })}
                />
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 truncate text-[15px] font-medium text-ink">{label}</p>
                  {isCurrent ? (
                    <span className="flex shrink-0 items-center gap-1 text-sm text-accent">
                      <Icon name="check" className="h-4 w-4" />
                      {t("designs.current")}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onApply(design.id)}
                      className={buttonClass("soft", "sm")}
                    >
                      {t("designs.apply")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
