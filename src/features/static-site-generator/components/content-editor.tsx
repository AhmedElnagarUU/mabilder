"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  annotateDocument,
  parseContentPath,
  serializeEditable,
} from "../content/content-inline";
import {
  blankValue,
  getAtPath,
  isContentObject,
  setAtPath,
  type ContentNode,
  type ContentPath,
} from "../content/content-tree";
import { formatContentPath, labelFor } from "../content/labels";
import type { ContentIssue } from "../content/validate-content";
import { Badge } from "@/shared/ui/badge";
import { buttonClass } from "@/shared/ui/button";
import { inputClass, labelClass } from "@/shared/ui/field";
import { SectionList } from "./content-fields";

type EditorStatus = "loading" | "ready" | "saving" | "saved" | "error";

type SaveResponse = {
  ok?: boolean;
  site?: { content: ContentNode | null };
  errors?: ContentIssue[];
  error?: string;
};

type SiteResponse = {
  site?: {
    businessName: string;
    status: string;
    content: ContentNode | null;
    error: string | null;
  };
  error?: string;
};

type ImageTarget = {
  path: string;
  value: string;
};

type ArrayActions = {
  addItem: (path: ContentPath) => void;
  removeItem: (path: ContentPath, index: number) => void;
  moveItem: (path: ContentPath, index: number, offset: number) => void;
};

const globalTabs = [
  { key: "site", label: "Site" },
  { key: "navigation", label: "Navigation" },
  { key: "footer", label: "Footer" },
] as const;

const pageTabs = [
  { key: "home", label: "Home", file: "index.html" },
  { key: "about", label: "Studio", file: "about.html" },
  { key: "services", label: "Services", file: "services.html" },
  { key: "work", label: "Work", file: "our-work.html" },
  { key: "profile", label: "Profile", file: "profile.html" },
  { key: "contact", label: "Contact", file: "contact.html" },
] as const;

type PageKey = (typeof pageTabs)[number]["key"];
type TabKey = (typeof globalTabs)[number]["key"] | PageKey;

type TabContent = {
  value: ContentNode;
  path: ContentPath;
  title: string;
};

const singleLineTags = new Set([
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "A",
  "BUTTON",
  "LABEL",
  "SPAN",
  "DT",
  "DD",
]);

const editStyles = `
  html.agenvo-edit-mode [data-agenvo-text]:hover {
    outline: 2px dashed rgba(11, 139, 134, 0.6);
    outline-offset: 3px;
    cursor: text;
  }

  html.agenvo-edit-mode [data-agenvo-image]:hover {
    outline: 2px dashed rgba(11, 139, 134, 0.95);
    outline-offset: 3px;
    cursor: pointer;
  }

  html.agenvo-edit-mode [contenteditable="true"] {
    outline: 2px solid #0b8b86;
    outline-offset: 3px;
    background-color: rgba(11, 139, 134, 0.08);
    cursor: text;
  }

  html.agenvo-edit-mode a {
    cursor: text;
  }

  html.agenvo-edit-mode img {
    user-select: none;
  }
`;

function getTab(content: ContentNode, tab: TabKey): TabContent | null {
  if (!isContentObject(content)) {
    return null;
  }

  if (tab === "site" || tab === "navigation" || tab === "footer") {
    const value = content[tab];

    if (value === undefined) {
      return null;
    }

    return { value, path: [tab], title: labelFor(tab) };
  }

  const pages = content.pages;

  if (!isContentObject(pages)) {
    return null;
  }

  const value = pages[tab];

  if (value === undefined) {
    return null;
  }

  return { value, path: ["pages", tab], title: labelFor(tab) };
}

function getStatusMessage(
  status: EditorStatus,
  dirty: boolean,
  aiRunning: boolean,
): string {
  if (aiRunning) {
    return "Writing your pages with AI. This can take a minute...";
  }

  switch (status) {
    case "loading":
      return "Loading content...";
    case "saving":
      return "Saving and regenerating the live website...";
    case "saved":
      return "Saved. The website is up to date.";
    case "error":
      return "Something needs attention.";
    case "ready":
      return dirty
        ? "Unsaved changes - click Save to update the website."
        : "All changes saved. Click any text on the page to edit it.";
  }
}

const siteStatusTones: Record<
  string,
  "neutral" | "warn" | "success" | "danger"
> = {
  draft: "neutral",
  generating: "warn",
  ready: "success",
  error: "danger",
};

const siteStatusLabels: Record<string, string> = {
  draft: "Draft",
  generating: "Generating",
  ready: "Ready",
  error: "Needs attention",
};

function siteStatusTone(
  status: string,
): "neutral" | "warn" | "success" | "danger" {
  return siteStatusTones[status] ?? "neutral";
}

function siteStatusLabel(status: string): string {
  return siteStatusLabels[status] ?? "Draft";
}

function startEditing(
  element: HTMLElement,
  doc: Document,
  win: Window,
  initialValue?: string,
): void {
  if (initialValue !== undefined && element.hasAttribute("data-count")) {
    element.textContent = initialValue;
  }

  element.setAttribute("contenteditable", "true");
  element.focus();

  const range = doc.createRange();
  range.selectNodeContents(element);
  range.collapse(false);

  const selection = win.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function ErrorBanner({ errors }: { errors: ContentIssue[] }) {
  return (
    <div className="border-b border-danger/15 bg-danger-soft px-4 py-3 text-xs text-danger sm:px-6">
      <p className="font-semibold">Please fix these fields</p>
      <ul className="mt-1 space-y-0.5">
        {errors.map((issue, index) => (
          <li key={`${issue.path}-${index}`}>
            {formatContentPath(issue.path)}: {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M2.1 12s3.6-7 9.9-7 9.9 7 9.9 7-3.6 7-9.9 7-9.9-7-9.9-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.8 10.8 0 0 1 12 5c6.3 0 9.9 7 9.9 7a17 17 0 0 1-2.4 3.3" />
      <path d="M6.6 6.7A16.6 16.6 0 0 0 2.1 12s3.6 7 9.9 7a10.7 10.7 0 0 0 4.3-.9" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function ImagePanel({
  target,
  onApply,
  onClose,
}: {
  target: ImageTarget;
  onApply: (path: string, value: string) => void;
  onClose: () => void;
}) {
  const [value, setValue] = useState(target.value);
  const preview = value.trim();

  return (
    <div className="absolute inset-x-4 bottom-4 z-30 mx-auto w-auto max-w-md rounded-panel border border-line bg-surface p-4 shadow-[0_24px_60px_-24px_rgba(30,33,24,0.45)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">Replace image</p>
          <p className="mt-0.5 text-xs text-muted">
            Paste a direct image URL. It is applied when you save.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-muted transition-colors hover:bg-panel hover:text-ink"
          aria-label="Close image editor"
        >
          <CloseIcon />
        </button>
      </div>

      <input
        type="url"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="https://images.example.com/photo.jpg"
        className={`${inputClass} mt-3`}
        autoFocus
      />

      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="mt-3 h-24 w-full rounded-lg border border-line object-cover"
        />
      ) : null}

      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className={buttonClass("secondary", "sm")}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onApply(target.path, preview)}
          disabled={!preview}
          className={buttonClass("primary", "sm")}
        >
          Apply
        </button>
      </div>
    </div>
  );
}

function SettingsDrawer({
  content,
  tab,
  onTabChange,
  onChange,
  actions,
  onClose,
}: {
  content: ContentNode;
  tab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onChange: (path: ContentPath, value: ContentNode) => void;
  actions: ArrayActions;
  onClose: () => void;
}) {
  const current = getTab(content, tab);

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-canvas/70 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <aside
        className="flex h-full w-full max-w-lg flex-col border-s border-line bg-canvas shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Content settings"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-line bg-surface px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-ink">
              Settings and hidden content
            </p>
            <p className="mt-0.5 text-xs text-muted">
              Metadata, links, alt text, placeholders and options.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-panel hover:text-ink"
            aria-label="Close settings"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="border-b border-line bg-surface px-4 py-3">
          <label className="block">
            <span className={labelClass}>Section</span>
            <select
              value={tab}
              onChange={(event) =>
                onTabChange(event.target.value as TabKey)
              }
              className={inputClass}
            >
              <optgroup label="Pages">
                {pageTabs.map((page) => (
                  <option key={page.key} value={page.key}>
                    {page.label}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Global">
                {globalTabs.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {current ? (
            <SectionList
              value={current.value}
              path={current.path}
              onChange={onChange}
              actions={actions}
            />
          ) : null}
        </div>

        <footer className="border-t border-line bg-surface px-4 py-3 text-xs text-muted">
          Changes here appear on the website after you click Save.
        </footer>
      </aside>
    </div>
  );
}

export function ContentEditor({ siteId }: { siteId: string }) {
  const [content, setContent] = useState<ContentNode | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState("");
  const [activePage, setActivePage] = useState<PageKey>("home");
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [status, setStatus] = useState<EditorStatus>("loading");
  const [errors, setErrors] = useState<ContentIssue[]>([]);
  const [imageTarget, setImageTarget] = useState<ImageTarget | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<TabKey>("home");
  const [previewKey, setPreviewKey] = useState(0);
  const [siteName, setSiteName] = useState("");
  const [siteStatus, setSiteStatus] = useState("ready");
  const [generationError, setGenerationError] = useState("");
  const [aiRunning, setAiRunning] = useState(false);

  const contentRef = useRef<ContentNode | null>(null);
  const savedSnapshotRef = useRef("");
  const initialContentRef = useRef<ContentNode | null>(null);
  const activePageRef = useRef<PageKey>("home");
  const modeRef = useRef<"edit" | "preview">("edit");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadContent(): Promise<void> {
      try {
        const response = await fetch(`/api/sites/${siteId}`, {
          cache: "no-store",
        });
        const result = (await response.json()) as SiteResponse;

        if (!response.ok || !result.site?.content) {
          throw new Error(result.error ?? "Content request failed.");
        }

        if (cancelled) {
          return;
        }

        const data = result.site.content;
        const snapshot = JSON.stringify(data);
        initialContentRef.current = data;
        contentRef.current = data;
        savedSnapshotRef.current = snapshot;
        setContent(data);
        setSavedSnapshot(snapshot);
        setSiteName(result.site.businessName);
        setSiteStatus(result.site.status);
        setGenerationError(result.site.error ?? "");
        setStatus("ready");
      } catch {
        if (cancelled) {
          return;
        }

        setErrors([
          {
            path: "content",
            message: "Could not load the site content.",
          },
        ]);
        setStatus("error");
      }
    }

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [siteId]);

  useEffect(() => {
    modeRef.current = mode;
    const doc = iframeRef.current?.contentDocument;

    if (!doc) {
      return;
    }

    doc.documentElement.classList.toggle("agenvo-edit-mode", mode === "edit");

    if (mode !== "edit") {
      const active = doc.activeElement as HTMLElement | null;

      if (active?.getAttribute("contenteditable") === "true") {
        active.blur();
      }
    }
  }, [mode]);

  const updateAtPath = useCallback(
    (path: ContentPath, value: ContentNode) => {
      const current = contentRef.current;

      if (!current) {
        return;
      }

      const next = setAtPath(current, path, value);
      contentRef.current = next;
      setContent(next);
      setStatus("ready");
      setErrors([]);
    },
    [],
  );

  const commitText = useCallback(
    (path: string, value: string) => {
      updateAtPath(parseContentPath(path), value);
    },
    [updateAtPath],
  );

  const openImageEditor = useCallback((path: string, src: string) => {
    setImageTarget({ path, value: src });
  }, []);

  const flushEditing = useCallback(() => {
    const active = iframeRef.current?.contentDocument
      ?.activeElement as HTMLElement | null;

    if (!active || active.getAttribute("contenteditable") !== "true") {
      return;
    }

    const path = active.getAttribute("data-agenvo-text");
    const value = serializeEditable(active);
    active.removeAttribute("contenteditable");

    if (path) {
      commitText(path, value);
    }
  }, [commitText]);

  const handleIframeLoad = useCallback(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    const win = iframe?.contentWindow;

    if (!doc || !win || !doc.body) {
      return;
    }

    if (!doc.getElementById("agenvo-edit-style")) {
      const style = doc.createElement("style");
      style.id = "agenvo-edit-style";
      style.textContent = editStyles;
      doc.head.appendChild(style);
    }

    if (contentRef.current) {
      annotateDocument(doc, contentRef.current);
    }

    doc.documentElement.classList.toggle(
      "agenvo-edit-mode",
      modeRef.current === "edit",
    );

    const file = win.location.pathname.split("/").filter(Boolean).pop() ?? "";
    const match = pageTabs.find((page) => page.file === file);

    if (match && match.key !== activePageRef.current) {
      activePageRef.current = match.key;
      setActivePage(match.key);
    }

    const commitActiveEditor = () => {
      const active = doc.activeElement as HTMLElement | null;

      if (!active || active.getAttribute("contenteditable") !== "true") {
        return;
      }

      const path = active.getAttribute("data-agenvo-text");
      const value = serializeEditable(active);
      active.removeAttribute("contenteditable");

      if (path) {
        commitText(path, value);
      }
    };

    const onClick = (event: MouseEvent) => {
      if (modeRef.current !== "edit") {
        return;
      }

      const target = event.target as HTMLElement | null;

      if (!target) {
        return;
      }

      if (target.closest("a")) {
        event.preventDefault();
      }

      event.stopPropagation();

      if (target.closest('[contenteditable="true"]')) {
        return;
      }

      commitActiveEditor();

      const image = target.closest<HTMLImageElement>("[data-agenvo-image]");

      if (image) {
        const path = image.getAttribute("data-agenvo-image");

        if (path) {
          openImageEditor(path, image.getAttribute("src") ?? "");
        }

        return;
      }

      const textElement =
        target.closest<HTMLElement>("[data-agenvo-text]") ??
        target.querySelector<HTMLElement>("[data-agenvo-text]");

      if (textElement) {
        const path = textElement.getAttribute("data-agenvo-text");
        const value =
          path && textElement.hasAttribute("data-count")
            ? getAtPath(contentRef.current ?? "", parseContentPath(path))
            : undefined;

        startEditing(
          textElement,
          doc,
          win,
          typeof value === "string" ? value : undefined,
        );
      }
    };

    const onInput = (event: Event) => {
      const element = event.target as HTMLElement | null;

      if (!element || element.getAttribute("contenteditable") !== "true") {
        return;
      }

      const path = element.getAttribute("data-agenvo-text");

      if (path) {
        commitText(path, serializeEditable(element));
      }
    };

    const onFocusOut = (event: FocusEvent) => {
      const element = event.target as HTMLElement | null;

      if (!element || element.getAttribute("contenteditable") !== "true") {
        return;
      }

      const path = element.getAttribute("data-agenvo-text");
      const value = serializeEditable(element);
      element.removeAttribute("contenteditable");

      if (path) {
        commitText(path, value);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const element = event.target as HTMLElement | null;

      if (!element || element.getAttribute("contenteditable") !== "true") {
        return;
      }

      const finishEditing = () => {
        commitActiveEditor();
        element.blur();
      };

      if (event.key === "Escape") {
        event.preventDefault();
        finishEditing();
        return;
      }

      if (
        event.key === "Enter" &&
        !event.shiftKey &&
        singleLineTags.has(element.tagName)
      ) {
        event.preventDefault();
        finishEditing();
      }
    };

    const onSubmit = (event: Event) => {
      if (modeRef.current === "edit") {
        event.preventDefault();
      }
    };

    const onDragStart = (event: Event) => {
      if (modeRef.current === "edit") {
        event.preventDefault();
      }
    };

    doc.addEventListener("click", onClick, true);
    doc.addEventListener("input", onInput, true);
    doc.addEventListener("focusout", onFocusOut, true);
    doc.addEventListener("keydown", onKeyDown, true);
    doc.addEventListener("submit", onSubmit, true);
    doc.addEventListener("dragstart", onDragStart, true);
  }, [commitText, openImageEditor]);

  const dirty =
    content !== null && JSON.stringify(content) !== savedSnapshot;
  const locked = dirty || status === "saving";
  const activePageFile =
    pageTabs.find((page) => page.key === activePage)?.file ?? "index.html";

  function hasUnsavedChanges(): boolean {
    return (
      contentRef.current !== null &&
      JSON.stringify(contentRef.current) !== savedSnapshotRef.current
    );
  }

  function selectPage(key: PageKey): void {
    if (key === activePage || status === "saving") {
      return;
    }

    flushEditing();

    if (hasUnsavedChanges()) {
      return;
    }

    activePageRef.current = key;
    setActivePage(key);
  }

  function toggleMode(): void {
    if (status === "saving") {
      return;
    }

    flushEditing();

    if (hasUnsavedChanges()) {
      return;
    }

    const next = mode === "edit" ? "preview" : "edit";
    modeRef.current = next;
    setMode(next);
  }

  function openSettings(): void {
    flushEditing();
    setSettingsTab(activePage);
    setSettingsOpen(true);
  }

  const handleAdd = useCallback((path: ContentPath) => {
    const current = contentRef.current;

    if (!current) {
      return;
    }

    const array = getAtPath(current, path);

    if (!Array.isArray(array)) {
      return;
    }

    const original = initialContentRef.current
      ? getAtPath(initialContentRef.current, path)
      : undefined;

    let source: ContentNode = "";

    if (array.length > 0) {
      source = array[array.length - 1];
    } else if (Array.isArray(original) && original.length > 0) {
      source = original[0];
    }

    const next = setAtPath(current, path, [...array, blankValue(source)]);
    contentRef.current = next;
    setContent(next);
    setStatus("ready");
  }, []);

  const handleRemove = useCallback((path: ContentPath, index: number) => {
    const current = contentRef.current;

    if (!current) {
      return;
    }

    const array = getAtPath(current, path);

    if (!Array.isArray(array)) {
      return;
    }

    const next = setAtPath(
      current,
      path,
      array.filter((_, itemIndex) => itemIndex !== index),
    );
    contentRef.current = next;
    setContent(next);
    setStatus("ready");
  }, []);

  const handleMove = useCallback(
    (path: ContentPath, index: number, offset: number) => {
      const current = contentRef.current;

      if (!current) {
        return;
      }

      const array = getAtPath(current, path);

      if (!Array.isArray(array)) {
        return;
      }

      const target = index + offset;

      if (target < 0 || target >= array.length) {
        return;
      }

      const next = [...array];
      const [item] = next.splice(index, 1);

      if (item === undefined) {
        return;
      }

      next.splice(target, 0, item);
      const updated = setAtPath(current, path, next);
      contentRef.current = updated;
      setContent(updated);
      setStatus("ready");
    },
    [],
  );

  async function handleSave(): Promise<void> {
    flushEditing();

    const current = contentRef.current;

    if (!current) {
      return;
    }

    const payload = JSON.stringify(current);

    if (payload === savedSnapshotRef.current) {
      return;
    }

    setStatus("saving");
    setErrors([]);

    try {
      const response = await fetch(`/api/sites/${siteId}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });
      const data = (await response.json()) as SaveResponse;

      if (!response.ok || !data.site?.content) {
        setErrors(
          data.errors ?? [
            {
              path: "content",
              message: data.error ?? "Saving failed.",
            },
          ],
        );
        setStatus("error");
        return;
      }

      const saved = data.site.content;
      const snapshot = JSON.stringify(saved);
      initialContentRef.current = saved;
      contentRef.current = saved;
      savedSnapshotRef.current = snapshot;
      setContent(saved);
      setSavedSnapshot(snapshot);
      setSiteStatus("ready");
      setGenerationError("");
      setStatus("saved");
      setPreviewKey((key) => key + 1);
    } catch {
      setErrors([
        {
          path: "content",
          message: "Could not reach the save endpoint.",
        },
      ]);
      setStatus("error");
    }
  }

  async function handleGenerate(): Promise<void> {
    if (dirty || status === "saving" || aiRunning) {
      return;
    }

    setAiRunning(true);
    setErrors([]);
    setGenerationError("");
    setSiteStatus("generating");

    try {
      const response = await fetch(`/api/sites/${siteId}/generate`, {
        method: "POST",
      });
      const data = (await response.json()) as SaveResponse;

      if (!response.ok || !data.site?.content) {
        setGenerationError(data.error ?? "AI generation failed.");
        setSiteStatus("error");
        return;
      }

      const generated = data.site.content;
      const snapshot = JSON.stringify(generated);
      initialContentRef.current = generated;
      contentRef.current = generated;
      savedSnapshotRef.current = snapshot;
      setContent(generated);
      setSavedSnapshot(snapshot);
      setSiteStatus("ready");
      setStatus("saved");
      setPreviewKey((key) => key + 1);
    } catch {
      setGenerationError("Could not reach the generation endpoint.");
      setSiteStatus("error");
    } finally {
      setAiRunning(false);
    }
  }

  if (!content) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-3 bg-canvas px-6 text-center">
        <p className="text-sm font-medium text-ink">
          {status === "error" ? "Could not load the editor." : "Loading editor..."}
        </p>
        {errors.length > 0 ? (
          <p className="max-w-md text-xs text-danger">
            {errors.map((issue) => issue.message).join(" ")}
          </p>
        ) : null}
      </main>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas text-ink">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-canvas/80 px-4 py-3 backdrop-blur-[22px] sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-medium text-[#04211f] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
            title="All websites"
          >
            {(siteName.trim()[0] ?? "W").toUpperCase()}
          </Link>
          <div>
            <p className="mono-label text-[7.5px] tracking-[0.14em] text-faint">
              {siteName || "Website"}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[19px] leading-none font-medium tracking-[-0.035em]">
                Website editor
              </h1>
              <Badge tone={siteStatusTone(siteStatus)}>
                {siteStatusLabel(siteStatus)}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={locked || aiRunning}
            title={
              dirty
                ? "Save your changes before rewriting with AI"
                : "Rewrite all pages with AI using the same business details"
            }
            className={buttonClass("soft", "sm", "px-3 py-2")}
          >
            {aiRunning
              ? "Writing..."
              : siteStatus === "draft"
                ? "Generate with AI"
                : "AI rewrite"}
          </button>

          <button
            type="button"
            onClick={openSettings}
            className={buttonClass("secondary", "sm", "px-3 py-2")}
          >
            <GearIcon />
            <span className="hidden sm:inline">Settings</span>
          </button>

          <a
            href={`/preview/${siteId}/index.html`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass(
              "secondary",
              "sm",
              "max-md:hidden px-3 py-2",
            )}
          >
            Open live site
          </a>

          <button
            type="button"
            onClick={toggleMode}
            disabled={locked}
            title={
              dirty
                ? "Save your changes before opening the preview"
                : mode === "edit"
                  ? "Switch to preview mode"
                  : "Switch back to editing"
            }
            aria-label={
              mode === "edit" ? "Switch to preview mode" : "Switch to edit mode"
            }
            className={buttonClass("secondary", "sm", "px-3 py-2")}
          >
            {mode === "edit" ? <EyeIcon /> : <EyeOffIcon />}
            <span className="hidden sm:inline">
              {mode === "edit" ? "Preview" : "Edit"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={!dirty || status === "saving"}
            className={buttonClass("primary", "sm", "px-4 py-2")}
          >
            {status === "saving" ? "Saving..." : "Save"}
          </button>
        </div>
      </header>

      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-line bg-canvas/80 px-3 py-2.5 backdrop-blur sm:px-5">
        <span className="mono-label me-2 hidden shrink-0 text-[7px] tracking-[0.14em] text-faint sm:inline">
          Pages
        </span>
        {pageTabs.map((page) => (
          <button
            key={page.key}
            type="button"
            onClick={() => selectPage(page.key)}
            disabled={locked && page.key !== activePage}
            title={
              locked && page.key !== activePage
                ? "Save your changes before switching pages"
                : undefined
            }
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              activePage === page.key
                ? "bg-[#e9e9e5] text-[#08080a] shadow-soft"
                : "text-muted hover:bg-surface hover:text-ink"
            } disabled:cursor-not-allowed disabled:opacity-40`}
          >
            {page.label}
          </button>
        ))}
        <span className="ms-auto hidden shrink-0 ps-3 text-xs text-muted md:inline">
          {getStatusMessage(status, dirty, aiRunning)}
        </span>
      </div>

      {errors.length > 0 ? <ErrorBanner errors={errors} /> : null}

      {generationError ? (
        <div className="border-b border-warn/20 bg-warn-soft px-4 py-3 text-xs text-warn sm:px-6">
          <p>
            AI is busy right now. Your draft is saved — try again in a minute.
          </p>
          <details className="mt-1">
            <summary className="cursor-pointer select-none font-medium text-warn/80 hover:text-warn">
              Details
            </summary>
            <p className="mt-1 break-words font-mono text-[10px] text-warn/70">
              {generationError}
            </p>
          </details>
        </div>
      ) : null}

      <div className="editor-stage relative flex-1 overflow-hidden p-3 sm:p-4">
        <div className="relative h-full overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          <iframe
            key={previewKey}
            ref={iframeRef}
            src={`/preview/${siteId}/${activePageFile}`}
            title="Website editor"
            onLoad={handleIframeLoad}
            className="h-full w-full border-0 bg-white"
          />
        </div>

        <div className="pointer-events-none absolute end-6 bottom-6 z-20 rounded-full border border-line bg-panel/85 px-3.5 py-1.5 text-[11px] font-medium text-ink shadow-soft backdrop-blur">
          {mode === "preview"
            ? "Preview mode - links are active"
            : dirty
              ? "Unsaved changes - click Save to update the website"
              : "Click text to edit - click an image to replace it"}
        </div>

        {imageTarget ? (
          <ImagePanel
            key={imageTarget.path}
            target={imageTarget}
            onApply={(path, value) => {
              updateAtPath(parseContentPath(path), value);
              const image = iframeRef.current?.contentDocument?.querySelector(
                `[data-agenvo-image="${path}"]`,
              );

              if (image) {
                image.setAttribute("src", value);
              }

              setImageTarget(null);
            }}
            onClose={() => setImageTarget(null)}
          />
        ) : null}
      </div>

      {settingsOpen ? (
        <SettingsDrawer
          content={content}
          tab={settingsTab}
          onTabChange={setSettingsTab}
          onChange={updateAtPath}
          actions={{
            addItem: handleAdd,
            removeItem: handleRemove,
            moveItem: handleMove,
          }}
          onClose={() => setSettingsOpen(false)}
        />
      ) : null}
    </div>
  );
}
