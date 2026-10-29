"use client";

import { useSyncExternalStore } from "react";
import type { EditorMode } from "../canvas-frame";

const storageKey = "editor.mode";
const listeners = new Set<() => void>();
let chosen: EditorMode | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function readMode(): EditorMode {
  if (chosen) {
    return chosen;
  }

  try {
    return window.localStorage.getItem(storageKey) === "content" ? "content" : "structure";
  } catch {
    return "structure";
  }
}

function writeMode(next: EditorMode): void {
  chosen = next;

  try {
    window.localStorage.setItem(storageKey, next);
  } catch {
    return;
  } finally {
    listeners.forEach((listener) => listener());
  }
}

export function useEditorMode(): [EditorMode, (next: EditorMode) => void] {
  const mode = useSyncExternalStore(subscribe, readMode, () => "structure" as EditorMode);
  return [mode, writeMode];
}
