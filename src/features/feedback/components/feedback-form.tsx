"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/shared/ui/button";
import { inputClass, labelClass } from "@/shared/ui/field";
import { MAX_FEEDBACK_MESSAGE_LENGTH } from "../types";

const RATINGS = [1, 2, 3, 4, 5];

type SubmitState = "idle" | "sending" | "sent" | "error";

type FeedbackBody = {
  message: string;
  rating?: number;
  page: string;
};

async function postFeedback(body: FeedbackBody): Promise<boolean> {
  try {
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function FeedbackForm({ onClose }: { onClose: () => void }) {
  const t = useTranslations("feedback");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [state, setState] = useState<SubmitState>("idle");
  const [empty, setEmpty] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (message.trim() === "") {
      setEmpty(true);
      return;
    }

    setEmpty(false);
    setState("sending");

    const sent = await postFeedback({
      message,
      ...(rating === null ? {} : { rating }),
      page: window.location.pathname,
    });

    setState(sent ? "sent" : "error");
  }

  if (state === "sent") {
    return (
      <div className="space-y-5">
        <p role="status" className="text-sm leading-[1.7] text-soft">
          {t("sent")}
        </p>
        <div className="flex justify-end">
          <button type="button" onClick={onClose} className={buttonClass("secondary", "md")}>
            {t("close")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <p className="text-sm leading-[1.7] text-muted">{t("intro")}</p>

      <div>
        <span className={labelClass}>{t("ratingLabel")}</span>
        <div className="flex gap-1">
          {RATINGS.map((value) => (
            <button
              key={value}
              type="button"
              aria-label={t("ratingOption", { count: value })}
              aria-pressed={rating === value}
              onClick={() => setRating(rating === value ? null : value)}
              className={`grid h-9 w-9 place-items-center rounded-lg text-lg transition-colors ${
                rating !== null && value <= rating ? "text-accent" : "text-faint hover:text-soft"
              }`}
            >
              <span aria-hidden>★</span>
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className={labelClass}>{t("messageLabel")}</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t("messagePlaceholder")}
          maxLength={MAX_FEEDBACK_MESSAGE_LENGTH}
          rows={5}
          className={`${inputClass} resize-y`}
        />
      </label>

      {empty ? (
        <p role="alert" className="text-sm text-danger">
          {t("errors.empty")}
        </p>
      ) : null}
      {state === "error" ? (
        <p role="alert" className="text-sm text-danger">
          {t("errors.default")}
        </p>
      ) : null}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className={buttonClass("secondary", "md")}>
          {t("cancel")}
        </button>
        <button type="submit" disabled={state === "sending"} className={buttonClass("accent", "md")}>
          {state === "sending" ? t("sending") : t("send")}
        </button>
      </div>
    </form>
  );
}
