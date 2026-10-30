"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { buttonClass } from "../../../shared/ui/button";
import { Icon } from "../../../shared/ui/icon";
import { MAX_INSTRUCTION_LENGTH } from "../../site-creation/rewrite-limits";
import type { RewriteError } from "../rewrite-request";
import type { RewriteSection } from "../rewrite-sections";

type RewriteDialogProps = {
  mode: "section" | "page";
  sections: RewriteSection[];
  left: number | null;
  running: boolean;
  error: RewriteError | null;
  onConfirm: (blockIds: string[], instruction: string) => void;
  onClose: () => void;
};

const exampleKeys = ["shorter", "moreFormal", "warmer"] as const;

function formatResetTime(value: string | null, locale: string): string {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(value),
  );
}

export function RewriteDialog({
  mode,
  sections,
  left,
  running,
  error,
  onConfirm,
  onClose,
}: RewriteDialogProps) {
  const t = useTranslations("editor.rewrite");
  const locale = useLocale();
  const [instruction, setInstruction] = useState("");
  const [selected, setSelected] = useState<string[]>(() =>
    sections.filter((section) => section.copy).map((section) => section.id),
  );

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === "Escape" && !running) {
        onClose();
      }
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, running]);

  const cost = selected.length;
  const tooExpensive = left !== null && cost > left;
  const canConfirm = cost > 0 && !running && !tooExpensive;

  function toggle(id: string): void {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function errorMessage(failure: RewriteError): string {
    if (failure.code === "credits_exhausted") {
      return t("errors.creditsExhausted", {
        time: formatResetTime(failure.nextResetAt, locale),
      });
    }

    return failure.code === "subscription_required"
      ? t("errors.subscriptionRequired")
      : t("errors.generic");
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rewrite-title"
        className="max-h-full w-full max-w-md overflow-y-auto rounded-panel border border-line bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.5)]"
      >
        <h2 id="rewrite-title" className="text-lg font-semibold text-ink">
          {mode === "page" ? t("pageTitle") : t("sectionTitle")}
        </h2>
        <p className="mt-1 text-[15px] text-muted">
          {mode === "page" ? t("pageHint") : t("sectionHint")}
        </p>

        {mode === "page" ? (
          <ul className="mt-4 space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <label
                  className={`flex items-center gap-3 rounded-lg px-2 py-2 text-[15px] ${
                    section.copy ? "cursor-pointer text-ink hover:bg-white/[0.04]" : "text-faint"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(section.id)}
                    disabled={!section.copy || running}
                    onChange={() => toggle(section.id)}
                    className="h-4 w-4 accent-[var(--color-accent)]"
                  />
                  <span className="min-w-0 flex-1 truncate">{section.label}</span>
                  {section.copy ? null : <span className="text-sm">{t("factNote")}</span>}
                </label>
              </li>
            ))}
          </ul>
        ) : null}

        <label className="mt-4 block text-[15px] text-soft" htmlFor="rewrite-instruction">
          {t("instructionLabel")}
        </label>
        <input
          id="rewrite-instruction"
          type="text"
          value={instruction}
          maxLength={MAX_INSTRUCTION_LENGTH}
          disabled={running}
          onChange={(event) => setInstruction(event.target.value)}
          placeholder={t("instructionPlaceholder")}
          className="mt-1.5 h-11 w-full rounded-xl border border-line bg-canvas px-3 text-base text-ink outline-none focus:border-accent/45"
        />
        <div className="mt-2 flex flex-wrap gap-2">
          {exampleKeys.map((key) => (
            <button
              key={key}
              type="button"
              disabled={running}
              onClick={() => setInstruction(t(`examples.${key}`))}
              className="h-8 rounded-full border border-line px-3 text-sm text-muted transition-colors hover:bg-white/[0.06] hover:text-ink disabled:opacity-45"
            >
              {t(`examples.${key}`)}
            </button>
          ))}
        </div>

        <p className="mt-4 text-[15px] text-ink">
          {left === null ? t("costOnly", { count: cost }) : t("cost", { count: cost, left })}
        </p>
        {tooExpensive ? <p className="mt-1 text-[15px] text-danger">{t("notEnough")}</p> : null}
        {error ? (
          <p role="alert" className="mt-3 text-[15px] text-danger">
            {errorMessage(error)}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={running}
            className={buttonClass("ghost", "md")}
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(selected, instruction.trim())}
            disabled={!canConfirm}
            className={buttonClass("accent", "md")}
          >
            {running ? (
              <span
                aria-hidden="true"
                className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            ) : (
              <Icon name="spark" className="h-4 w-4" />
            )}
            {running ? t("running") : t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
