"use client";

import { useState } from "react";

type GenerationStatus = "idle" | "generating" | "success" | "error";

type GenerationResponse = {
  previewUrl: string;
};

async function requestSiteGeneration(): Promise<string> {
  const response = await fetch("/api/generate-site", { method: "POST" });

  if (!response.ok) {
    throw new Error(`Generation failed with status ${response.status}`);
  }

  const data = (await response.json()) as GenerationResponse;
  return data.previewUrl;
}

export function GenerateSiteButton() {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function handleGenerate(): Promise<void> {
    setStatus("generating");
    setPreviewUrl(null);

    try {
      setPreviewUrl(await requestSiteGeneration());
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleGenerate}
        disabled={status === "generating"}
        className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {status === "generating" ? "Generating..." : "Generate website"}
      </button>

      <p
        className="mt-4 min-h-6 text-sm text-zinc-600 dark:text-zinc-400"
        role="status"
        aria-live="polite"
      >
        {status === "generating" ? "Building your five static pages." : null}
        {status === "success" ? "Your website is ready." : null}
        {status === "error" ? "Something went wrong. Please try again." : null}
      </p>

      {previewUrl ? (
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Open generated website
        </a>
      ) : null}
    </div>
  );
}
