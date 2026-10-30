"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { buttonClass } from "@/shared/ui/button";
import { getTour, type TourId, type TourStep } from "../tours";

const GAP = 12;
const EDGE = 8;
const POPOVER_WIDTH = 320;
const ARROW = 12;
const SHEET_BREAKPOINT = 640;

type Side = "top" | "bottom" | "start" | "end";

type Placement = {
  side: Side | "sheet";
  left: number;
  top: number;
  arrowLeft: number;
  arrowTop: number;
};

type Box = { width: number; height: number };

function findTarget(target: string): HTMLElement | null {
  const matches = document.querySelectorAll<HTMLElement>(`[data-tour="${target}"]`);

  for (const element of matches) {
    const rect = element.getBoundingClientRect();

    if (rect.width > 0 && rect.height > 0) {
      return element;
    }
  }

  return null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

function roomFor(side: Side, rect: DOMRect, pop: Box, rtl: boolean): number {
  const space = {
    top: rect.top - pop.height,
    bottom: window.innerHeight - rect.bottom - pop.height,
    left: rect.left - pop.width,
    right: window.innerWidth - rect.right - pop.width,
  };

  if (side === "top" || side === "bottom") {
    return space[side] - GAP;
  }

  const physical = (side === "start") === rtl ? "right" : "left";
  return space[physical] - GAP;
}

function placePopover(rect: DOMRect, pop: Box, rtl: boolean): Placement {
  if (window.innerWidth < SHEET_BREAKPOINT) {
    return { side: "sheet", left: 0, top: 0, arrowLeft: 0, arrowTop: 0 };
  }

  const order: Side[] = ["bottom", "top", "end", "start"];
  const fitting = order.find((side) => roomFor(side, rect, pop, rtl) >= 0);
  const side =
    fitting ?? order.reduce((best, next) => (roomFor(next, rect, pop, rtl) > roomFor(best, rect, pop, rtl) ? next : best));

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const maxLeft = window.innerWidth - pop.width - EDGE;
  const maxTop = window.innerHeight - pop.height - EDGE;
  const endIsRight = !rtl;
  const onRight = (side === "end") === endIsRight;

  let left = clamp(centerX - pop.width / 2, EDGE, maxLeft);
  let top = clamp(centerY - pop.height / 2, EDGE, maxTop);

  if (side === "bottom") {
    top = rect.bottom + GAP;
  } else if (side === "top") {
    top = rect.top - GAP - pop.height;
  } else {
    left = onRight ? rect.right + GAP : rect.left - GAP - pop.width;
  }

  left = clamp(left, EDGE, maxLeft);
  top = clamp(top, EDGE, maxTop);

  const vertical = side === "top" || side === "bottom";
  const arrowLeft = vertical
    ? clamp(centerX - left, 16, pop.width - 16) - ARROW / 2
    : onRight
      ? -ARROW / 2
      : pop.width - ARROW / 2;
  const arrowTop = vertical
    ? side === "bottom"
      ? -ARROW / 2
      : pop.height - ARROW / 2
    : clamp(centerY - top, 16, pop.height - 16) - ARROW / 2;

  return { side, left, top, arrowLeft, arrowTop };
}

function arrowBorderClass(side: Side | "sheet", rtl: boolean): string {
  const onRight = (side === "end") === !rtl;

  if (side === "bottom") {
    return "border-l border-t";
  }

  if (side === "top") {
    return "border-r border-b";
  }

  return onRight ? "border-l border-b" : "border-r border-t";
}

function revealTarget(element: HTMLElement): void {
  const mobile = window.innerWidth < SHEET_BREAKPOINT;
  element.scrollIntoView({ block: mobile ? "start" : "nearest", inline: "nearest" });
}

export function Tour({
  tourId,
  onClose,
}: {
  tourId: TourId;
  onClose: (completed: boolean) => void;
}) {
  const t = useTranslations("onboarding");
  const popoverRef = useRef<HTMLDivElement>(null);
  const [steps] = useState<TourStep[]>(() =>
    getTour(tourId).steps.filter((candidate) => findTarget(candidate.target)),
  );
  const [index, setIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const rtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const current = steps[index];
  const isLast = index === steps.length - 1;

  useEffect(() => {
    if (steps.length === 0) {
      onClose(false);
    }
  }, [steps, onClose]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;

    return () => opener?.focus?.();
  }, []);

  useEffect(() => {
    function skipOnEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        onClose(true);
      }
    }

    function refresh(): void {
      setTick((value) => value + 1);
    }

    document.addEventListener("keydown", skipOnEscape);
    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);

    return () => {
      document.removeEventListener("keydown", skipOnEscape);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
    };
  }, [onClose]);

  useEffect(() => {
    if (!current) {
      return;
    }

    const element = findTarget(current.target);

    if (element) {
      revealTarget(element);
    }

    popoverRef.current?.focus();
  }, [current]);

  useLayoutEffect(() => {
    const popover = popoverRef.current;
    const element = current ? findTarget(current.target) : null;

    if (!popover || !element) {
      return;
    }

    const rect = element.getBoundingClientRect();
    const box = popover.getBoundingClientRect();

    setTargetRect(rect);
    setPlacement(placePopover(rect, { width: box.width, height: box.height }, rtl));
  }, [current, tick, rtl]);

  if (!current) {
    return null;
  }

  const sheet = placement?.side === "sheet";
  const style = !placement || sheet
    ? undefined
    : { left: placement.left, top: placement.top, width: POPOVER_WIDTH };

  return (
    <>
      {targetRect ? (
        <div
          aria-hidden
          className="pointer-events-none fixed z-[60] rounded-xl border-2 border-accent/70 shadow-[0_0_0_4px_rgba(94,234,212,0.12)]"
          style={{
            left: targetRect.left - 4,
            top: targetRect.top - 4,
            width: targetRect.width + 8,
            height: targetRect.height + 8,
          }}
        />
      ) : null}

      <div
        ref={popoverRef}
        role="dialog"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        tabIndex={-1}
        style={style}
        className={`fixed z-[61] rounded-panel border border-line bg-[rgba(14,14,17,0.94)] p-4 text-start shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl outline-none ${
          sheet
            ? "inset-x-3 bottom-3"
            : "max-w-[calc(100vw-16px)]"
        } ${placement || sheet ? "" : "invisible"}`}
      >
        {placement && !sheet ? (
          <span
            aria-hidden
            className={`absolute h-3 w-3 rotate-45 bg-[rgb(14,14,17)] border-line ${arrowBorderClass(placement.side, rtl)}`}
            style={{ left: placement.arrowLeft, top: placement.arrowTop }}
          />
        ) : null}

        <p className="mono-label text-xs tracking-[0.12em] text-faint">
          {t("ui.counter", { current: index + 1, total: steps.length })}
        </p>
        <h2 id="tour-title" className="mt-1.5 text-base font-medium text-ink">
          {t(current.titleKey)}
        </h2>
        <p id="tour-body" className="mt-1.5 text-[15px] leading-relaxed text-muted">
          {t(current.bodyKey)}
        </p>

        <div className="mt-4 flex items-center gap-2">
          {isLast ? null : (
            <button
              type="button"
              onClick={() => onClose(true)}
              className={buttonClass("ghost", "sm")}
            >
              {t("ui.skip")}
            </button>
          )}
          <span className="ms-auto flex items-center gap-2">
            {index > 0 ? (
              <button
                type="button"
                onClick={() => setIndex(index - 1)}
                className={buttonClass("secondary", "sm")}
              >
                {t("ui.back")}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => (isLast ? onClose(true) : setIndex(index + 1))}
              className={buttonClass("primary", "sm")}
            >
              {isLast ? t("ui.done") : t("ui.next")}
            </button>
          </span>
        </div>
      </div>
    </>
  );
}
