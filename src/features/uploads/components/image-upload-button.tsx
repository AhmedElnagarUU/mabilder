"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "../../../shared/ui/button";
import { Icon } from "../../../shared/ui/icon";
import { uploadImage, type UploadFailure } from "../upload-file";
import { uploadContentTypes, type UploadSlotId } from "../types";

export function ImageUploadButton({
  siteId,
  slotId,
  onUploaded,
  disabled = false,
  className = "",
}: {
  siteId?: string;
  slotId: UploadSlotId;
  onUploaded: (publicUrl: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  const t = useTranslations("uploads");
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [failure, setFailure] = useState<UploadFailure | null>(null);

  const busy = progress !== null;
  const unavailable = failure === "uploads_unavailable";

  async function handleChange(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    setFailure(null);
    setProgress(0);

    const outcome = await uploadImage(siteId, slotId, file, setProgress);

    setProgress(null);

    if ("failure" in outcome) {
      setFailure(outcome.failure);
      return;
    }

    onUploaded(outcome.publicUrl);
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={uploadContentTypes.join(",")}
        onChange={(event) => void handleChange(event)}
        className="hidden"
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || busy || unavailable}
        className={buttonClass("secondary", "sm", "gap-1.5")}
      >
        <Icon name="image"className="h-3.5 w-3.5" />
        {busy ? `${t("uploading")} ${progress}%` : t("button")}
      </button>
      {failure ? (
        <p role="alert" className="mt-1 text-sm text-danger">
          {t(`errors.${failure}`)}
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted">{t("hint")}</p>
      )}
    </div>
  );
}
