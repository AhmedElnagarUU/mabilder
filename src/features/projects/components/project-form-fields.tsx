"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/shared/ui/button";
import { inputClass, labelClass } from "@/shared/ui/field";
import { Icon } from "@/shared/ui/icon";
import type { Locale, LocalizedValue } from "./project-form-state";

// One input per site language; the second language is optional.
export function LocalizedField({
  label,
  value,
  locales,
  onChange,
  required = false,
  multiline = false,
}: {
  label: string;
  value: LocalizedValue;
  locales: Locale[];
  onChange: (locale: Locale, text: string) => void;
  required?: boolean;
  multiline?: boolean;
}) {
  const t = useTranslations("projects.form");

  return (
    <div>
      <span className={labelClass}>
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      <div className={locales.length > 1 ? "grid gap-2 sm:grid-cols-2" : ""}>
        {locales.map((locale, index) => {
          const props = {
            value: value[locale],
            onChange: (event: { target: { value: string } }) => onChange(locale, event.target.value),
            required: required && index === 0,
            "aria-label": locales.length > 1 ? `${label} (${t(`languages.${locale}`)})` : label,
            placeholder: locales.length > 1 ? t(`languages.${locale}`) : undefined,
            className: inputClass,
          };

          return multiline ? (
            <textarea key={locale} rows={3} {...props} className={`${inputClass} resize-y`} />
          ) : (
            <input key={locale} type="text" {...props} />
          );
        })}
      </div>
    </div>
  );
}

const chipClass =
  "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition";

// Scope tags: the business's services are one tap each; any other tag can be typed.
export function ScopeTags({
  services,
  value,
  onChange,
}: {
  services: string[];
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const t = useTranslations("projects.form.scope");
  const [draft, setDraft] = useState("");

  const custom = value.filter((tag) => !services.includes(tag));

  function toggle(tag: string): void {
    onChange(value.includes(tag) ? value.filter((item) => item !== tag) : [...value, tag]);
  }

  function addDraft(): void {
    const tag = draft.trim();

    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }

    setDraft("");
  }

  return (
    <div>
      <span className={labelClass}>{t("label")}</span>
      <div className="flex flex-wrap gap-2">
        {services.map((service) => (
          <button
            key={service}
            type="button"
            aria-pressed={value.includes(service)}
            onClick={() => toggle(service)}
            className={`${chipClass} ${
              value.includes(service)
                ? "border-accent/40 bg-accent/15 text-accent"
                : "border-line text-ink hover:bg-white/[0.06]"
            }`}
          >
            {service}
          </button>
        ))}
        {custom.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            aria-label={`${t("remove")}: ${tag}`}
            className={`${chipClass} border-accent/40 bg-accent/15 text-accent`}
          >
            {tag}
            <Icon name="plus" className="h-3 w-3 rotate-45" />
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 sm:max-w-md">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addDraft();
            }
          }}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          className={inputClass}
        />
        <button
          type="button"
          disabled={draft.trim() === ""}
          onClick={addDraft}
          className={buttonClass("secondary", "sm", "shrink-0 gap-1.5")}
        >
          <Icon name="plus" className="h-3.5 w-3.5" />
          {t("add")}
        </button>
      </div>
    </div>
  );
}
