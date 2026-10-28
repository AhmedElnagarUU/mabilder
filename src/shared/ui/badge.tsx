import type { ReactNode } from "react";

type BadgeTone = "neutral" | "warn" | "success" | "danger";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border border-line bg-white/[0.04] text-muted",
  warn: "border border-warn/25 bg-warn-soft text-warn",
  success: "border border-ok/25 bg-ok-soft text-ok",
  danger: "border border-danger/25 bg-danger-soft text-danger",
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
