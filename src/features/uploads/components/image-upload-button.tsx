"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "../../../shared/ui/button";
import { Icon } from "../../../shared/ui/icon";
import { uploadImage, type UploadFailure } from "../upload-file";
import { uploadContentTypes, type UploadSlotId } from "../types";

type UploadItem = {
  name: string;
  progress: number;
  failure: UploadFailure | null;
};

// `onUploaded` is called once per uploaded file, in the order the files were picked.
// With `multiple`, one pick can hold up to `maxFiles` files and each file shows its own progress.
export function ImageUploadButton({
  siteId,
  slotId,
  onUploaded,
  multiple = false,
  maxFiles = 15,
  disabled = false,
  className = "",
}: {
  siteId?: string;
  slotId: UploadSlotId;
  onUploaded: (publicUrl: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}) {
  const t = useTranslations("uploads");
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [skipped, setSkipped] = useState(false);
  const [busy, setBusy] = useState(false);

  const unavailable = items.some((item) => item.failure === "uploads_unavailable");

  function updateItem(index: number, change: Partial<UploadItem>): void {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...change } : item)),
    );
  }

  async function handleChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";

    const files = picked.slice(0, multiple ? maxFiles : 1);

    if (files.length === 0) {
      return;
    }

    setSkipped(picked.length > files.length);
    setItems(files.map((file) => ({ name: file.name, progress: 0, failure: null })));
    setBusy(true);

    const outcomes = await Promise.all(
      files.map(async (file, index) => {
        const outcome = await uploadImage(siteId, slotId, file, (progress) =>
          updateItem(index, { progress }),
        );

        if ("failure" in outcome) {
          updateItem(index, { failure: outcome.failure });
        }

        return outcome;
      }),
    );

    setBusy(false);

    for (const outcome of outcomes) {
      if ("publicUrl" in outcome) {
        onUploaded(outcome.publicUrl);
      }
    }

    setItems((current) => current.filter((item) => item.failure !== null));
  }

  const failed = items.filter((item) => item.failure !== null);
  const average = items.length
    ? Math.round(items.reduce((sum, item) => sum + item.progress, 0) / items.length)
    : 0;

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={uploadContentTypes.join(",")}
        multiple={multiple}
        onChange={(event) => void handleChange(event)}
        className="hidden"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || busy || unavailable || (multiple && maxFiles < 1)}
        className={buttonClass("secondary", "sm", "gap-1.5")}
      >
        <Icon name="image" className="h-3.5 w-3.5" />
        {busy ? `${t("uploading")} ${average}%` : t(multiple ? "buttonMany" : "button")}
      </button>
      {busy && multiple ? (
        <ul className="mt-2 space-y-1.5" aria-label={t("progressAria")}>
          {items.map((item, index) => (
            <li key={index} className="text-sm text-muted">
              <div className="flex justify-between gap-3">
                <span className="truncate" dir="auto">
                  {item.name}
                </span>
                <span className={item.failure ? "text-danger" : ""}>
                  {item.failure ? t(`errors.${item.failure}`) : `${item.progress}%`}
                </span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-accent" style={{ width: `${item.progress}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      {skipped ? (
        <p role="alert" className="mt-1 text-sm text-warn">
          {t("tooMany", { max: maxFiles })}
        </p>
      ) : null}
      {!busy && failed.length > 0 ? (
        <ul role="alert" className="mt-1 space-y-0.5 text-sm text-danger">
          {failed.map((item, index) => (
            <li key={index}>
              {multiple ? (
                <span dir="auto">{item.name}: </span>
              ) : null}
              {t(`errors.${item.failure as UploadFailure}`)}
            </li>
          ))}
        </ul>
      ) : null}
      {failed.length === 0 && !busy ? (
        <p className="mt-1 text-sm text-muted">{t("hint")}</p>
      ) : null}
    </div>
  );
}
