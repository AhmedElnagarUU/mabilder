"use client";

import { useTranslations } from "next-intl";
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
      <ol className="flex flex-col gap-1.5">
        {wizardSteps.map((step, index) => {
          const done = index < current;
          const active = index === current;

          return (
            <li key={step.key}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                disabled={index > current}
                aria-current={active ? "step" : undefined}
                className={`flex w-full items-center gap-2.5 rounded-full border py-1.5 pe-4 ps-1.5 text-start transition-colors disabled:cursor-default ${
                  active
                    ? "border-transparent bg-[#e9e9e5] text-[#08080a]"
                    : done
                      ? "border-accent/25 bg-accent/10 text-ink"
                      : "border-line bg-white/[0.022] text-muted hover:bg-white/[0.05]"
                }`}
              >
                <span
                  className={`mono-label grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                    active
                      ? "bg-black/[0.08] text-[#08080a]"
                      : done
                        ? "bg-accent/15 text-accent"
                        : "bg-white/[0.04] text-muted"
                  }`}
                >
                  {index + 1}
                </span>
                <span className="truncate text-[12.5px] font-medium">
                  {t(`steps.${step.key}.title`)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
