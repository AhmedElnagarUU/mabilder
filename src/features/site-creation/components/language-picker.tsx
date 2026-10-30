"use client";

import { useTranslations } from "next-intl";
import type { Locale } from "../../static-site-generator/locale";

export type LanguageChoice = "en" | "ar" | "both";

export type LanguageSelection = {
  choice: LanguageChoice;
  mainLocale: Locale;
};

export function toWebsiteLanguages({ choice, mainLocale }: LanguageSelection) {
  if (choice === "both") {
    return { locales: ["en", "ar"] as Locale[], defaultLocale: mainLocale };
  }

  return { locales: [choice] as Locale[], defaultLocale: choice };
}

const choices: LanguageChoice[] = ["en", "ar", "both"];
const locales: Locale[] = ["en", "ar"];

const labelClass = "mb-2 block text-sm font-medium text-ink";

function optionClass(selected: boolean): string {
  return `cursor-pointer rounded-xl border px-4 py-2.5 text-[15px] transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-accent ${
    selected
      ? "border-accent bg-accent/10 text-ink"
      : "border-line text-muted hover:text-ink"
  }`;
}

function Option({
  name,
  value,
  label,
  selected,
  onSelect,
}: {
  name: string;
  value: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label className={optionClass(selected)}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      {label}
    </label>
  );
}

export function LanguagePicker({
  value,
  onChange,
}: {
  value: LanguageSelection;
  onChange: (value: LanguageSelection) => void;
}) {
  const t = useTranslations("siteCreation.languages");

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className={labelClass}>{t("label")}</legend>
        <div className="flex flex-wrap gap-3">
          {choices.map((choice) => (
            <Option
              key={choice}
              name="websiteLanguage"
              value={choice}
              label={t(choice)}
              selected={value.choice === choice}
              onSelect={() => onChange({ ...value, choice })}
            />
          ))}
        </div>
      </fieldset>

      {value.choice === "both" ? (
        <fieldset>
          <legend className={labelClass}>{t("mainLabel")}</legend>
          <div className="flex flex-wrap gap-3">
            {locales.map((locale) => (
              <Option
                key={locale}
                name="mainLanguage"
                value={locale}
                label={t(locale)}
                selected={value.mainLocale === locale}
                onSelect={() => onChange({ ...value, mainLocale: locale })}
              />
            ))}
          </div>
          <p className="mt-2 text-sm leading-5 text-muted">{t("mainHint")}</p>
        </fieldset>
      ) : null}
    </div>
  );
}
