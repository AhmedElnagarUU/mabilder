"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/shared/ui/button";
import { inputClass } from "@/shared/ui/field";
import { Icon } from "@/shared/ui/icon";
import { ImageUploadButton } from "@/features/uploads/components/image-upload-button";
import type { PhotoState } from "./project-form-state";

function moveItem(photos: PhotoState[], from: number, to: number): PhotoState[] {
  if (to < 0 || to >= photos.length || from === to) {
    return photos;
  }

  const next = [...photos];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

function isImageLink(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}

const iconButton = buttonClass("ghost", "sm", "w-9 px-0");

// The first photo is the cover. `withCover` is false for the "before" photos, which have none.
export function ProjectPhotos({
  siteId,
  photos,
  onChange,
  max,
  withCover,
  disabled,
}: {
  siteId: string;
  photos: PhotoState[];
  onChange: (update: (photos: PhotoState[]) => PhotoState[]) => void;
  max: number;
  withCover: boolean;
  disabled: boolean;
}) {
  const t = useTranslations("projects.form.photoList");
  const [link, setLink] = useState("");
  const [dragFrom, setDragFrom] = useState<number | null>(null);

  const full = photos.length >= max;

  function addPhotos(urls: string[]): void {
    onChange((current) => [...current, ...urls.map((url) => ({ url, alt: "" }))].slice(0, max));
  }

  // Uploads finish together, so the callback may run several times before the next render.
  function handleUploaded(url: string): void {
    addPhotos([url]);
  }

  function handleAddLink(): void {
    if (isImageLink(link.trim())) {
      addPhotos([link.trim()]);
      setLink("");
    }
  }

  function setAlt(index: number, alt: string): void {
    onChange((current) =>
      current.map((photo, photoIndex) => (photoIndex === index ? { ...photo, alt } : photo)),
    );
  }

  return (
    <div className="space-y-3">
      {photos.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <li
              key={`${photo.url}-${index}`}
              draggable={!disabled}
              onDragStart={() => setDragFrom(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragFrom !== null) {
                  const from = dragFrom;
                  onChange((current) => moveItem(current, from, index));
                }
                setDragFrom(null);
              }}
              onDragEnd={() => setDragFrom(null)}
              className="overflow-hidden rounded-xl border border-line-soft bg-white/[0.02]"
            >
              <div className="relative aspect-[3/2] bg-white/[0.04]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.alt} className="h-full w-full object-cover" />
                {withCover && index === 0 ? (
                  <span className="absolute start-2 top-2 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-[#04211f]">
                    {t("cover")}
                  </span>
                ) : null}
              </div>
              <div className="space-y-2 p-2.5">
                <input
                  type="text"
                  value={photo.alt}
                  onChange={(event) => setAlt(index, event.target.value)}
                  placeholder={t("altPlaceholder")}
                  aria-label={t("alt")}
                  className={inputClass}
                />
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    disabled={disabled || index === 0}
                    onClick={() => onChange((current) => moveItem(current, index, index - 1))}
                    aria-label={t("moveEarlier")}
                    title={t("moveEarlier")}
                    className={iconButton}
                  >
                    <Icon name="chevron" className="h-4 w-4 rotate-90 rtl:-rotate-90" />
                  </button>
                  <button
                    type="button"
                    disabled={disabled || index === photos.length - 1}
                    onClick={() => onChange((current) => moveItem(current, index, index + 1))}
                    aria-label={t("moveLater")}
                    title={t("moveLater")}
                    className={iconButton}
                  >
                    <Icon name="chevron" className="h-4 w-4 -rotate-90 rtl:rotate-90" />
                  </button>
                  {withCover && index > 0 ? (
                    <button
                      type="button"
                      disabled={disabled}
                      onClick={() => onChange((current) => moveItem(current, index, 0))}
                      className={buttonClass("soft", "sm")}
                    >
                      {t("setCover")}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange((current) => current.filter((_photo, photoIndex) => photoIndex !== index))}
                    aria-label={t("remove")}
                    title={t("remove")}
                    className={buttonClass("danger", "sm", "ms-auto w-9 px-0")}
                  >
                    <Icon name="trash" className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="text-sm text-muted">{t("count", { count: photos.length, max })}</p>

      {full ? (
        <p className="text-sm text-warn">{t("full", { max })}</p>
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <ImageUploadButton
            siteId={siteId}
            slotId="projects"
            multiple
            maxFiles={max - photos.length}
            onUploaded={handleUploaded}
            disabled={disabled}
          />
          <div className="flex flex-1 items-center gap-2">
            <input
              type="url"
              dir="ltr"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleAddLink();
                }
              }}
              placeholder={t("linkPlaceholder")}
              aria-label={t("link")}
              className={inputClass}
            />
            <button
              type="button"
              disabled={disabled || !isImageLink(link.trim())}
              onClick={handleAddLink}
              className={buttonClass("secondary", "sm", "shrink-0 gap-1.5")}
            >
              <Icon name="plus" className="h-3.5 w-3.5" />
              {t("addLink")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
