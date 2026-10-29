"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/shared/ui/button";
import { Field, TextAreaField, inputClass, labelClass } from "@/shared/ui/field";
import { Icon } from "@/shared/ui/icon";
import {
  MAX_PROJECT_PHOTOS,
  type LocalizedText,
  type Project,
  type ProjectsSite,
} from "../types";
import { sendProjectRequest } from "./project-request";

type Locale = ProjectsSite["defaultLocale"];
type TextKey = "title" | "category" | "location" | "description";

type FormState = {
  text: Record<TextKey, Record<Locale, string>>;
  year: string;
  photos: { url: string; alt: string }[];
  showOnHome: boolean;
};

const emptyText = { en: "", ar: "" };

function textOf(field: LocalizedText | undefined): Record<Locale, string> {
  return { en: field?.en ?? "", ar: field?.ar ?? "" };
}

function toFormState(project: Project | undefined): FormState {
  return {
    text: {
      title: project ? textOf(project.title) : emptyText,
      category: textOf(project?.category),
      location: textOf(project?.location),
      description: textOf(project?.description),
    },
    year: project?.year ?? "",
    photos: project?.photos.map((photo) => ({ url: photo.url, alt: photo.alt ?? "" })) ?? [],
    showOnHome: project?.showOnHome ?? true,
  };
}

function toRequestBody(state: FormState) {
  return {
    ...state.text,
    year: state.year,
    photos: state.photos.filter((photo) => photo.url.trim() !== ""),
    showOnHome: state.showOnHome,
  };
}

export function ProjectForm({
  site,
  project,
  onSaved,
  onCancel,
}: {
  site: ProjectsSite;
  project?: Project;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const t = useTranslations("projects.form");
  const errors = useTranslations("projects.errors");
  const [state, setState] = useState(() => toFormState(project));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const locales = [site.defaultLocale, ...site.locales.filter((locale) => locale !== site.defaultLocale)];

  function setText(key: TextKey, locale: Locale, value: string): void {
    setState((current) => ({
      ...current,
      text: { ...current.text, [key]: { ...current.text[key], [locale]: value } },
    }));
  }

  function setPhoto(index: number, key: "url" | "alt", value: string): void {
    setState((current) => ({
      ...current,
      photos: current.photos.map((photo, photoIndex) =>
        photoIndex === index ? { ...photo, [key]: value } : photo,
      ),
    }));
  }

  function addPhoto(): void {
    setState((current) => ({ ...current, photos: [...current.photos, { url: "", alt: "" }] }));
  }

  function removePhoto(index: number): void {
    setState((current) => ({
      ...current,
      photos: current.photos.filter((_photo, photoIndex) => photoIndex !== index),
    }));
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setBusy(true);
    setError("");

    const failure = project
      ? await sendProjectRequest(`/api/projects/${project.id}`, "PUT", toRequestBody(state))
      : await sendProjectRequest("/api/projects", "POST", toRequestBody(state));

    setBusy(false);

    if (failure) {
      setError(errors(failure));
      return;
    }

    onSaved();
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="space-y-5 rounded-panel border border-line-soft bg-[linear-gradient(160deg,rgba(255,255,255,0.036),rgba(255,255,255,0.01))] p-5"
    >
      <h2 className="text-base font-medium text-[#dededb]">
        {project ? t("titleEdit") : t("titleNew")}
      </h2>

      {locales.map((locale, index) => (
        <fieldset key={locale} className="space-y-3">
          {site.locales.length > 1 ? (
            <legend className="mb-2 text-sm font-medium text-ink">
              {t(`languages.${locale}`)}
              {index > 0 ? (
                <span className="ms-2 font-normal text-muted">{t("secondLanguageHint")}</span>
              ) : null}
            </legend>
          ) : null}
          <Field
            label={t("title")}
            value={state.text.title[locale]}
            onChange={(value) => setText("title", locale, value)}
            required={index === 0}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={t("category")}
              value={state.text.category[locale]}
              onChange={(value) => setText("category", locale, value)}
            />
            <Field
              label={t("location")}
              value={state.text.location[locale]}
              onChange={(value) => setText("location", locale, value)}
            />
          </div>
          <TextAreaField
            label={t("description")}
            value={state.text.description[locale]}
            onChange={(value) => setText("description", locale, value)}
          />
        </fieldset>
      ))}

      <div className="sm:max-w-40">
        <Field
          label={t("year")}
          value={state.year}
          onChange={(value) => setState((current) => ({ ...current, year: value }))}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-ink">{t("photos")}</legend>
        <p className="text-sm text-muted">{t("photosHint", { max: MAX_PROJECT_PHOTOS })}</p>
        {state.photos.map((photo, index) => (
          <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <label className="block flex-1">
              <span className={labelClass}>{t("photoUrl")}</span>
              <input
                type="url"
                dir="ltr"
                value={photo.url}
                onChange={(event) => setPhoto(index, "url", event.target.value)}
                placeholder="https://"
                className={inputClass}
              />
            </label>
            <label className="block flex-1">
              <span className={labelClass}>{t("photoAlt")}</span>
              <input
                type="text"
                value={photo.alt}
                onChange={(event) => setPhoto(index, "alt", event.target.value)}
                className={inputClass}
              />
            </label>
            <button
              type="button"
              onClick={() => removePhoto(index)}
              aria-label={t("removePhoto")}
              title={t("removePhoto")}
              className={buttonClass("danger", "sm", "h-11 shrink-0")}
            >
              <Icon name="trash" className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
        {state.photos.length < MAX_PROJECT_PHOTOS ? (
          <button type="button" onClick={addPhoto} className={buttonClass("secondary", "sm", "gap-1.5")}>
            <Icon name="plus" className="h-3.5 w-3.5" />
            {t("addPhoto")}
          </button>
        ) : null}
      </fieldset>

      <label className="flex items-center gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          checked={state.showOnHome}
          onChange={(event) => setState((current) => ({ ...current, showOnHome: event.target.checked }))}
          className="h-4 w-4 accent-[#5eead4]"
        />
        {t("showOnHome")}
      </label>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" disabled={busy} className={buttonClass("primary", "md")}>
          {busy ? t("saving") : t("save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className={buttonClass("ghost", "md")}
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
