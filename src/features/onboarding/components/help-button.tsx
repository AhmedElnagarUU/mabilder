"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { TourId } from "../tours";
import { Tour } from "./tour";

const AUTO_START_DELAY_MS = 700;

function doneKey(tourId: TourId): string {
  return `tour.${tourId}.done`;
}

function isTourDone(tourId: TourId): boolean {
  try {
    return localStorage.getItem(doneKey(tourId)) === "1";
  } catch {
    return false;
  }
}

function markTourDone(tourId: TourId): void {
  try {
    localStorage.setItem(doneKey(tourId), "1");
  } catch {
    // Storage can be blocked; the tour may then show again, which is harmless.
  }
}

export function HelpButton({ tourId }: { tourId: TourId }) {
  const t = useTranslations("onboarding");
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (isTourDone(tourId)) {
      return;
    }

    const timer = window.setTimeout(() => setRunning(true), AUTO_START_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [tourId]);

  const handleClose = useCallback(
    (completed: boolean) => {
      if (completed) {
        markTourDone(tourId);
      }

      setRunning(false);
    },
    [tourId],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setRunning(true)}
        aria-label={t("ui.help")}
        title={t("ui.help")}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-line bg-white/[0.045] text-base font-medium text-soft transition-colors hover:bg-white/[0.08] hover:text-ink"
      >
        ?
      </button>

      {running ? <Tour tourId={tourId} onClose={handleClose} /> : null}
    </>
  );
}
