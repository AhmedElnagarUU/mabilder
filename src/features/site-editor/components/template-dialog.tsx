"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import type { TemplateChoice } from "../template-choice";
import { TemplateChoiceList } from "./template-choice-list";

type TemplateDialogProps = {
  siteId: string;
  choices: TemplateChoice[];
  currentId: string;
  busyId: string | null;
  onUse: (templateId: string) => void;
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

// "Change template" in the editor: the same cards as the pick page, in a dialog, so the editor
// keeps its state and can offer Undo after the pick.
export function TemplateDialog({
  siteId,
  choices,
  currentId,
  busyId,
  onUse,
  onClose,
}: TemplateDialogProps) {
  const t = useTranslations("templatePicker.change");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-3 sm:p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="template-dialog-title"
        className="flex max-h-full w-full max-w-5xl flex-col rounded-panel border border-line bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-line p-4 sm:p-5">
          <div className="min-w-0">
            <h2 id="template-dialog-title" className="text-lg font-semibold text-ink">
              {t("title")}
            </h2>
            <p className="mt-1 text-[15px] text-muted">{t("hint")}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            title={t("close")}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.08] hover:text-ink"
          >
            <span aria-hidden="true" className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5">
          <TemplateChoiceList
            siteId={siteId}
            choices={choices}
            currentId={currentId}
            busyId={busyId}
            onUse={onUse}
          />
        </div>
      </div>
    </div>
  );
}
