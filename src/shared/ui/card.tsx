import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-card border border-line bg-[linear-gradient(158deg,rgba(255,255,255,0.046),rgba(255,255,255,0.012)_52%,rgba(255,255,255,0.02))] shadow-soft ${className}`}
    >
      {children}
    </div>
  );
}
