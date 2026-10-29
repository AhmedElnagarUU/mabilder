"use client";

import { useEffect, useRef, useState } from "react";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { Icon } from "@/shared/ui/icon";
import type { NotificationItem, NotificationList } from "../types";

const POLL_INTERVAL_MS = 60_000;

async function fetchNotifications(): Promise<NotificationList | null> {
  try {
    const response = await fetch("/api/notifications", { cache: "no-store" });
    return response.ok ? ((await response.json()) as NotificationList) : null;
  } catch {
    return null;
  }
}

export function NotificationBell() {
  const t = useTranslations("notifications");
  const format = useFormatter();
  const now = useNow({ updateInterval: POLL_INTERVAL_MS });
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function load(): Promise<void> {
    const list = await fetchNotifications();

    if (list) {
      setItems(list.items);
      setUnreadCount(list.unreadCount);
    }
  }

  useEffect(() => {
    const firstLoad = setTimeout(() => void load(), 0);
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearTimeout(firstLoad);
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    function closeOnOutsideClick(event: MouseEvent): void {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function toggle(): void {
    if (!open) {
      void load();
    }

    setOpen(!open);
  }

  async function markAllRead(): Promise<void> {
    const response = await fetch("/api/notifications/read", { method: "POST" });

    if (response.ok) {
      const readAt = new Date().toISOString();
      setItems(items.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
      setUnreadCount(0);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={
          unreadCount > 0 ? t("openUnread", { count: unreadCount }) : t("open")
        }
        title={t("open")}
        className="relative grid h-9 w-9 place-items-center rounded-full border border-line bg-white/[0.045] text-soft transition-colors hover:text-ink"
      >
        <Icon name="bell" className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -end-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-medium leading-none text-canvas">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute end-0 top-full z-50 mt-2 w-[320px] max-w-[calc(100vw-1.75rem)] overflow-hidden rounded-panel border border-line bg-surface shadow-[0_18px_50px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between gap-3 border-b border-line-soft px-3.5 py-2.5">
            <h3 className="text-[13px] font-medium text-ink">{t("title")}</h3>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={() => void markAllRead()}
                className="text-[11px] text-accent hover:underline"
              >
                {t("markAllRead")}
              </button>
            ) : null}
          </div>

          {items.length === 0 ? (
            <p className="px-3.5 py-4 text-[13px] leading-[1.7] text-muted">
              {t("empty")}
            </p>
          ) : (
            <ul className="max-h-[360px] divide-y divide-white/[0.04] overflow-y-auto">
              {items.map((item) => (
                <li key={item.id} className="flex gap-2.5 px-3.5 py-2.5">
                  <span
                    aria-hidden
                    className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${
                      item.readAt ? "bg-transparent" : "bg-accent"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">
                      {t(`types.${item.type}.title`)}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-[1.6] text-muted">
                      {t(`types.${item.type}.body`, item.params)}
                    </p>
                    <p className="mt-0.5 text-[11px] text-faint">
                      {format.relativeTime(new Date(item.createdAt), now)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  );
}
