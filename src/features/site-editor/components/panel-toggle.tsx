"use client";

import { useTranslations } from "next-intl";
import { Icon } from "../../../shared/ui/icon";

type Direction = "start" | "end";

const arrowClass: Record<Direction, string> = {
  start: "rotate-90 rtl:-rotate-90",
  end: "-rotate-90 rtl:rotate-90",
};

const opposite: Record<Direction, Direction> = { start: "end", end: "start" };

export function PanelToggle({
  direction,
  onClick,
}: {
  direction: Direction;
  onClick: () => void;
}) {
  const t = useTranslations("editor");

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={t("panel.hidePanel")}
      title={t("panel.hidePanel")}
      className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-white/[0.08] hover:text-ink max-lg:hidden"
    >
      <Icon name="chevron" className={`h-4 w-4 ${arrowClass[direction]}`} />
    </button>
  );
}

export function PanelRail({
  side,
  onShow,
}: {
  side: Direction;
  onShow: () => void;
}) {
  const t = useTranslations("editor");

  return (
    <div
      className={`hidden w-7 shrink-0 flex-col items-center bg-surface pt-3 lg:flex ${
        side === "start" ? "border-e" : "border-s"
      } border-line`}
    >
      <button
        type="button"
        onClick={onShow}
        aria-label={t("panel.showPanel")}
        title={t("panel.showPanel")}
        className="grid h-7 w-7 place-items-center rounded-md text-muted transition-colors hover:bg-white/[0.08] hover:text-ink"
      >
        <Icon name="chevron" className={`h-4 w-4 ${arrowClass[opposite[side]]}`} />
      </button>
    </div>
  );
}
