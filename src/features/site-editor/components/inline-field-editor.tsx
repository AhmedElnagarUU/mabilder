"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "../../../shared/ui/button";
import { inputClass } from "../../../shared/ui/field";
import type { EditableField } from "../content-ops";
import { fieldLabelKey } from "../field-groups";
import type { OverlayBounds, OverlayRect } from "../preview-document";
import { ImageUploadButton } from "../../uploads/components/image-upload-button";

type InlineFieldEditorProps = {
  siteId: string;
  mode: "text" | "image";
  field: EditableField;
  rect: OverlayRect;
  bounds: OverlayBounds;
  onApply?: (value: string) => void;
  onCancel?: () => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function TextHint({
  label,
  rect,
  bounds,
  hint,
}: {
  label: string;
  rect: OverlayRect;
  bounds: OverlayBounds;
  hint: string;
}) {
  const top = rect.top > 48 ? rect.top - 36 : rect.top + rect.height + 8;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: clamp(rect.left, 8, Math.max(8, bounds.width - 280)),
      }}
      className="glass-strong pointer-events-none z-30 flex items-center gap-2 rounded-full px-3 py-1.5 text-sm text-ink shadow-soft"
    >
      <span className="font-medium">{label}</span>
      <span className="text-faint">{hint}</span>
    </div>
  );
}

function ImageEditor({
  siteId,
  label,
  field,
  rect,
  bounds,
  onApply,
  onCancel,
}: {
  siteId: string;
  label: string;
  field: EditableField;
  rect: OverlayRect;
  bounds: OverlayBounds;
  onApply: (value: string) => void;
  onCancel: () => void;
}) {
  const t = useTranslations("editor");
  const [value, setValue] = useState(field.value);
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const next = value.trim();

    if (!/^https?:\/\/\S+$/i.test(next)) {
      setError(t("canvas.invalidImage"));
      return;
    }

    onApply(next);
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        position: "absolute",
        top: clamp(rect.top + 8, 12, Math.max(12, bounds.height - 300)),
        left: clamp(rect.left, 12, Math.max(12, bounds.width - 332)),
      }}
      className="glass-strong z-40 w-80 rounded-panel p-3 text-ink shadow-soft"
    >
      <p className="font-mono text-[13px] font-medium tracking-[0.1em] text-muted uppercase">
        {label}
      </p>
      <input
        type="url"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          setError("");
        }}
        placeholder="https://"
        autoFocus
        className={`${inputClass} mt-1.5`}
      />
      {error ? <p className="mt-1 text-sm text-danger">{error}</p> : null}
      <ImageUploadButton
        siteId={siteId}
        slotId="editor"
        onUploaded={onApply}
        className="mt-2"
      />
      <div className="mt-2 flex justify-end gap-1.5">
        <button
          type="button"
          onClick={onCancel}
          className={buttonClass("ghost", "sm", "h-8 px-3 text-[15px]")}
        >
          {t("canvas.cancel")}
        </button>
        <button
          type="submit"
          className={buttonClass("primary", "sm", "h-8 px-3 text-[15px]")}
        >
          {t("canvas.apply")}
        </button>
      </div>
    </form>
  );
}

export function InlineFieldEditor({
  siteId,
  mode,
  field,
  rect,
  bounds,
  onApply,
  onCancel,
}: InlineFieldEditorProps) {
  const t = useTranslations("editor");
  const label = t(`fields.${fieldLabelKey(field)}`);

  if (mode === "text") {
    return (
      <TextHint label={label} rect={rect} bounds={bounds} hint={t("canvas.editHint")} />
    );
  }

  return (
    <ImageEditor
      siteId={siteId}
      label={label}
      field={field}
      rect={rect}
      bounds={bounds}
      onApply={onApply ?? (() => undefined)}
      onCancel={onCancel ?? (() => undefined)}
    />
  );
}
