"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
const chosen = new Map<string, boolean>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readOpen(key: string): boolean {
  const known = chosen.get(key);

  if (known !== undefined) {
    return known;
  }

  try {
    return window.localStorage.getItem(key) !== "closed";
  } catch {
    return true;
  }
}

function writeOpen(key: string, open: boolean): void {
  chosen.set(key, open);

  try {
    window.localStorage.setItem(key, open ? "open" : "closed");
  } catch {
    return;
  } finally {
    listeners.forEach((listener) => listener());
  }
}

export function usePanelOpen(key: string): [boolean, (open: boolean) => void] {
  const open = useSyncExternalStore(
    subscribe,
    () => readOpen(key),
    () => true,
  );

  return [open, (next) => writeOpen(key, next)];
}
