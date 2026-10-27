import type { ReactNode } from "react";

type BadgeTone = "neutral" | "warn" | "success" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "bg-panel text-muted",
  warn: "bg-warn-soft text-warn",
  success: "bg-ok-soft text-ok",
  danger: "bg-danger-soft text-danger",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
