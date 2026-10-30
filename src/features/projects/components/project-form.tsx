"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/shared/ui/button";
import { Field, SelectField } from "@/shared/ui/field";
import {
  MAX_PROJECT_PHOTOS,
  projectCategories,
  projectStatuses,
  type Project,
  type ProjectsSite,
} from "../types";
import { LocalizedField, ScopeTags } from "./project-form-fields";
import {
  toFormState,
  toRequestBody,
  type FormState,
  type Locale,
  type PhotoState,
  type TextKey,
} from "./project-form-state";
import { ProjectPhotos } from "./project-photos";
import { sendProjectRequest } from "./project-request";

function FormGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t border-line-soft pt-5">
      <legend className="pe-3 text-base font-medium text-ink">{title}</legend>
      {children}
    </fieldset>
  );
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

  const locales: Locale[] = [
    site.defaultLocale,
    ...site.locales.filter((locale) => locale !== site.defaultLocale),
  ];

  function setField<Key extends keyof FormState>(key: Key, value: FormState[Key]): void {
    setState((current) => ({ ...current, [key]: value }));
  }

  function textField(key: TextKey) {
    return {
      value: state.text[key],
      locales,
      onChange: (locale: Locale, text: string) =>
        setState((current) => ({
          ...current,
          text: { ...current.text, [key]: { ...current.text[key], [locale]: text } },
        })),
    };
  }

  function photosField(key: "photos" | "beforePhotos") {
    return (update: (photos: PhotoState[]) => PhotoState[]) =>
      setState((current) => ({ ...current, [key]: update(current[key]) }));
  }

  async function handleSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setError("");

    if (state.photos.every((photo) => photo.url.trim() === "")) {
      setError(t("photosRequired"));
      return;
    }

    setBusy(true);

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
      className="space-y-6 rounded-panel border border-line-soft bg-[linear-gradient(160deg,rgba(255,255,255,0.036),rgba(255,255,255,0.01))] p-5 text-base"
    >
      <h2 className="text-lg font-medium text-[#dededb]">
        {project ? t("titleEdit") : t("titleNew")}
      </h2>
      {site.locales.length > 1 ? (
        <p className="text-sm text-muted">{t("secondLanguageHint")}</p>
      ) : null}

      <FormGroup title={t("groups.basics")}>
        <LocalizedField label={t("title")} required {...textField("title")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label={t("category")}
            value={state.categoryKey}
            onChange={(value) => setField("categoryKey", value)}
            options={[
              { value: "", label: t("notSet") },
              ...projectCategories.map((key) => ({ value: key, label: t(`categories.${key}`) })),
            ]}
          />
          <SelectField
            label={t("status")}
            value={state.status}
            onChange={(value) => setField("status", value)}
            options={[
              { value: "", label: t("notSet") },
              ...projectStatuses.map((key) => ({ value: key, label: t(`statuses.${key}`) })),
            ]}
          />
        </div>
        {state.categoryKey === "other" ? (
          <LocalizedField label={t("categoryOther")} {...textField("categoryOther")} />
        ) : null}
        <LocalizedField label={t("location")} {...textField("location")} />
        <div className="sm:max-w-40">
          <Field label={t("year")} value={state.year} onChange={(value) => setField("year", value)} />
        </div>
      </FormGroup>

      <FormGroup title={t("groups.details")}>
        <LocalizedField label={t("client")} {...textField("client")} />
        <div className="sm:max-w-40">
          <Field
            label={t("area")}
            type="number"
            value={state.area}
            onChange={(value) => setField("area", value)}
          />
        </div>
        <LocalizedField label={t("duration")} {...textField("duration")} />
        <ScopeTags
          services={site.services}
          value={state.scope}
          onChange={(tags) => setField("scope", tags)}
        />
      </FormGroup>

      <FormGroup title={t("groups.story")}>
        <LocalizedField label={t("description")} multiline {...textField("description")} />
        <LocalizedField label={t("challenge")} multiline {...textField("challenge")} />
        <LocalizedField label={t("solution")} multiline {...textField("solution")} />
        <LocalizedField label={t("result")} multiline {...textField("result")} />
      </FormGroup>

      <FormGroup title={t("groups.photos")}>
        <p className="text-sm text-muted">{t("photosGuide")}</p>
        <ProjectPhotos
          siteId={site.siteId}
          photos={state.photos}
          onChange={photosField("photos")}
          max={MAX_PROJECT_PHOTOS}
          withCover
          disabled={busy}
        />
        <div className="space-y-2 pt-2">
          <h3 className="text-sm font-medium text-ink">{t("beforeTitle")}</h3>
          <p className="text-sm text-muted">{t("beforeHint")}</p>
          <ProjectPhotos
            siteId={site.siteId}
            photos={state.beforePhotos}
            onChange={photosField("beforePhotos")}
            max={MAX_PROJECT_PHOTOS}
            withCover={false}
            disabled={busy}
          />
        </div>
      </FormGroup>

      <label className="flex items-center gap-2.5 text-sm text-ink">
        <input
          type="checkbox"
          checked={state.showOnHome}
          onChange={(event) => setField("showOnHome", event.target.checked)}
          className="h-4 w-4 accent-[#5eead4]"
        />
        {t("showOnHome")}
      </label>

      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}

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
