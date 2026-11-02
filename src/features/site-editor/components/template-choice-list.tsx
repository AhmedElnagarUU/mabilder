"use client";

import { useTranslations } from "next-intl";
import { buttonClass } from "../../../shared/ui/button";
import { Icon } from "../../../shared/ui/icon";
import type { TemplateChoice } from "../template-choice";

type TemplateChoiceListProps = {
  siteId: string;
  choices: TemplateChoice[];
  currentId: string;
  busyId: string | null;
  onUse: (templateId: string) => void;
};

// The cards shared by the "Choose your template" page and the editor's "Change template" dialog.
export function TemplateChoiceList({
  siteId,
  choices,
  currentId,
  busyId,
  onUse,
}: TemplateChoiceListProps) {
  const t = useTranslations("templatePicker.card");

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {choices.map((choice) => {
        const isCurrent = choice.id === currentId;
        const previewHref = `/api/sites/${siteId}/template-preview/${choice.id}`;

        return (
          <li
            key={choice.id}
            className={`flex flex-col overflow-hidden rounded-3xl border bg-panel ${
              isCurrent ? "border-accent/60" : "border-line"
            }`}
          >
            <div className="pointer-events-none" aria-hidden>
              {choice.cover}
            </div>

            <div className="flex flex-1 flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="min-w-0 truncate text-[15px] font-medium text-ink">{choice.name}</h3>
                {isCurrent ? (
                  <span className="flex shrink-0 items-center gap-1 text-sm text-accent">
                    <Icon name="check" className="h-4 w-4" />
                    {t("current")}
                  </span>
                ) : null}
              </div>
              <p className="text-[13px] leading-relaxed text-muted">{choice.mood}</p>

              <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                <a
                  href={previewHref}
                  target="_blank"
                  rel="noopener"
                  className={buttonClass("secondary", "sm")}
                >
                  {t("preview")}
                  <span className="sr-only">{t("newTab", { name: choice.name })}</span>
                </a>
                {isCurrent ? null : (
                  <button
                    type="button"
                    disabled={busyId !== null}
                    onClick={() => onUse(choice.id)}
                    className={buttonClass("primary", "sm")}
                  >
                    {busyId === choice.id ? t("using") : t("use")}
                  </button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
