"use client";

import { useEffect, useRef } from "react";
import { buttonClass } from "./button";

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  onDismiss = onCancel,
  busy = false,
  danger = false,
}: {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  onDismiss?: () => void;
  busy?: boolean;
  danger?: boolean;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    function dismissOnEscape(event: KeyboardEvent): void {
      if (event.key === "Escape" && !busy) {
        onDismiss();
      }
    }

    document.addEventListener("keydown", dismissOnEscape);

    return () => {
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [busy, onDismiss]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={description ? "confirm-dialog-description" : undefined}
        className="w-full max-w-sm rounded-panel border border-line bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.5)]"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        {description ? (
          <p
            id="confirm-dialog-description"
            className="mt-2 text-sm leading-relaxed text-muted"
          >
            {description}
          </p>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={busy}
            className={buttonClass("ghost", "md")}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={buttonClass(danger ? "danger" : "primary", "md")}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
