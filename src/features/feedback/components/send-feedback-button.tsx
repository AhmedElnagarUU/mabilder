"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/shared/ui/button";
import { FeedbackForm } from "./feedback-form";

export function SendFeedbackButton() {
  const t = useTranslations("feedback");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={buttonClass("secondary", "sm", "px-3.5")}
      >
        {t("open")}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="send-feedback-title"
            className="w-full max-w-md rounded-panel border border-line bg-surface p-6 shadow-[0_18px_50px_rgba(0,0,0,0.5)]"
          >
            <h2 id="send-feedback-title" className="mb-4 text-lg font-semibold text-ink">
              {t("title")}
            </h2>
            <FeedbackForm onClose={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}
