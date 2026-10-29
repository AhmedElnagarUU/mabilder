"use client";

import { useTranslations } from "next-intl";
import type { DeviceId } from "../canvas-frame";

type CanvasFrameHeaderProps = {
  device: DeviceId;
  deviceWidth: number;
  frameHeight: number;
};

export function CanvasFrameHeader({
  device,
  deviceWidth,
  frameHeight,
}: CanvasFrameHeaderProps) {
  const t = useTranslations("editor");

  return (
    <div className="flex h-9 items-center justify-between gap-2 border-b border-line bg-surface px-3">
      <div className="flex min-w-0 items-center gap-2 max-sm:hidden">
        <span className="mono-label text-[10px] tracking-[0.12em] text-muted">
          {t(`devices.${device}`)}
        </span>
        <span dir="ltr" className="font-mono text-xs text-faint">
          {deviceWidth} × {Math.round(frameHeight)}
        </span>
      </div>
    </div>
  );
}
