"use client";

import { useState } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import { buttonClass } from "@/shared/ui/button";
import { inputClass } from "@/shared/ui/field";
import type { FeedbackStatus } from "../../feedback/types";

async function postChange(feedbackId: string, path: string, body: unknown): Promise<boolean> {
  try {
    const response = await fetch(`/api/admin/feedback/${feedbackId}/${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function FeedbackItemActions({
  feedbackId,
  status,
}: {
  feedbackId: string;
  status: FeedbackStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");

  async function run(path: string, body: unknown): Promise<boolean> {
    setBusy(true);
    setError("");

    const ok = await postChange(feedbackId, path, body);

    if (ok) {
      router.refresh();
    } else {
      setError("The change failed. Try again.");
    }

    setBusy(false);
    return ok;
  }

  async function sendReply(): Promise<void> {
    if (await run("reply", { reply })) {
      setReply("");
      setReplying(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {status === "new" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run("status", { status: "read" })}
            className={buttonClass("secondary", "sm")}
          >
            Mark read
          </button>
        ) : null}
        {status !== "resolved" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => void run("status", { status: "resolved" })}
            className={buttonClass("secondary", "sm")}
          >
            Resolve
          </button>
        ) : null}
        <button
          type="button"
          disabled={busy}
          onClick={() => setReplying(!replying)}
          className={buttonClass("secondary", "sm")}
        >
          Reply
        </button>
        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>

      {replying ? (
        <div className="space-y-2">
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            maxLength={2000}
            rows={3}
            aria-label="Reply to the customer"
            className={`${inputClass} resize-y`}
          />
          <button
            type="button"
            disabled={busy || reply.trim() === ""}
            onClick={() => void sendReply()}
            className={buttonClass("accent", "sm")}
          >
            Send reply
          </button>
        </div>
      ) : null}
    </div>
  );
}
