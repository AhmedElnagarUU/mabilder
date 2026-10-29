"use client";

import { Link } from "../../../shared/i18n/navigation";
import { Icon } from "../../../shared/ui/icon";

export type SaveToastMessage = {
  id: number;
  kind: "success" | "error";
  message: string;
  link?: { href: string; label: string };
};

export function SaveToast({ toast }: { toast: SaveToastMessage | null }) {
  if (!toast) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center px-4">
      <div
        role="status"
        className={`glass-strong flex items-center gap-2 rounded-full px-4 py-2 text-sm shadow-soft ${
          toast.kind === "success" ? "text-accent" : "text-danger"
        }`}
      >
        <Icon
          name={toast.kind === "success" ? "check" : "alert"}
          className="h-4 w-4 shrink-0"
        />
        <span className="text-ink">{toast.message}</span>
        {toast.link ? (
          <Link href={toast.link.href} className="pointer-events-auto font-semibold underline">
            {toast.link.label}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
