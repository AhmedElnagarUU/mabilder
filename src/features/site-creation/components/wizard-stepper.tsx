"use client";

import { useTranslations } from "next-intl";
import { Icon } from "@/shared/ui/icon";
import { wizardSteps } from "../wizard-steps";

export function WizardStepper({
  current,
  onSelect,
}: {
  current: number;
  onSelect: (index: number) => void;
}) {
  const t = useTranslations("siteCreation");

  return (
    <nav aria-label={t("stepper.aria")}>
      <ol>
        {wizardSteps.map((step, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <li key={step.key} className="relative">
              {index < wizardSteps.length - 1 ? (
                <span
                  aria-hidden
                  className={`absolute start-[18px] top-11 h-[calc(100%-1.75rem)] w-px ${
                    done ? "bg-ink/25" : "bg-line"
                  }`}
                />
              ) : null}

              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={index > current}
                aria-current={active ? "step" : undefined}
                className="group relative flex w-full items-start gap-4 rounded-xl py-2 text-start transition-colors hover:bg-white/40 disabled:cursor-default disabled:hover:bg-transparent"
              >
                <span
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-[9px] transition-colors ${
                    active
                      ? "border-accent bg-accent text-white shadow-[0_8px_18px_-10px_rgba(6,91,92,0.55)]"
                      : done
                        ? "border-accent/25 bg-white/70 text-ink"
                        : "border-line bg-white/35 text-muted"
                  }`}
                >
                  {done ? <Icon name="check" className="h-3.5 w-3.5" /> : index + 1}
                </span>
                <span className="pt-0.5">
                  <span
                    className={`block text-[13px] font-medium ${
                      active || done ? "text-ink" : "text-muted"
                    }`}
                  >
                    {t(`steps.${step.key}.title`)}
                  </span>
                  <span className="mono-label mt-1 block text-[6.5px] leading-4 tracking-[0.04em] text-faint">
                    {t(`steps.${step.key}.description`)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
