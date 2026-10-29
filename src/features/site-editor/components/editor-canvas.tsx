"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Icon } from "../../../shared/ui/icon";
import type { Locale } from "../../static-site-generator/locale";
import type { Page, SiteContent } from "../../static-site-generator/site-content";
import {
  editableFields,
  type EditableField,
} from "../content-ops";
import { annotateDocument } from "../annotate-preview";
import {
  buildPreviewDocument,
  fieldPathKey,
  findBlockElement,
  findFieldElement,
  paintFocus,
  paintSelection,
  parseInternalLink,
  rectOf,
  type OverlayRect,
} from "../preview-document";
import {
  deviceWidths,
  fitScale,
  frameBorder,
  frameHeaderHeight,
  stageGutter,
  type DeviceId,
  type EditorMode,
} from "../canvas-frame";
import {
  injectEditorStyle,
  parseFieldPath,
  patchPreviewFields,
  placeCaretAtEnd,
  refreshIcons,
  syncPreviewSections,
} from "../preview-sync";
import { CanvasFrameHeader } from "./canvas-frame-header";
import { InlineFieldEditor } from "./inline-field-editor";

export type ScrollRequest = {
  blockId: string;
  nonce: number;
};

type EditorCanvasProps = {
  siteId: string;
  content: SiteContent;
  page: Page;
  locale: Locale;
  mode: EditorMode;
  selectedBlockId: string | null;
  device: DeviceId;
  scrollRequest: ScrollRequest | null;
  onSelectBlock: (blockId: string | null) => void;
  onCommit: (blockId: string, path: (string | number)[], value: string) => void;
  onMove: (blockId: string, direction: "up" | "down") => void;
  onHide: (blockId: string) => void;
  onNavigate: (pageSlug: string, locale?: Locale) => void;
  onEditText: (blockId: string) => void;
};

type TextEditing = {
  blockId: string;
  field: EditableField;
  element: HTMLElement;
  original: string;
};

type ActiveImage = {
  blockId: string;
  field: EditableField;
};

type CanvasCallbacks = Pick<
  EditorCanvasProps,
  "onSelectBlock" | "onCommit" | "onMove" | "onHide" | "onNavigate" | "onEditText"
>;

type StageSize = {
  width: number;
  height: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function EditorCanvas({
  siteId,
  content,
  page,
  locale,
  mode,
  selectedBlockId,
  device,
  scrollRequest,
  onSelectBlock,
  onCommit,
  onMove,
  onHide,
  onNavigate,
  onEditText,
}: EditorCanvasProps) {
  const t = useTranslations("editor");
  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const readyRef = useRef(false);
  const editingRef = useRef<TextEditing | null>(null);
  const selectedRef = useRef<string | null>(null);
  const modeRef = useRef<EditorMode>(mode);
  const activeImageRef = useRef<ActiveImage | null>(null);
  const scaleRef = useRef(1);
  const measureRef = useRef<() => void>(() => {});
  const callbacksRef = useRef<CanvasCallbacks>({
    onSelectBlock,
    onCommit,
    onMove,
    onHide,
    onNavigate,
    onEditText,
  });
  const contentRef = useRef(content);
  const pageRef = useRef(page);
  const localeRef = useRef(locale);

  const [srcDoc] = useState(() =>
    buildPreviewDocument(content, siteId, page.slug, locale),
  );
  const [stageSize, setStageSize] = useState<StageSize>({ width: 0, height: 0 });
  const [focusHeight, setFocusHeight] = useState<number | null>(null);
  const [activeImage, setActiveImage] = useState<ActiveImage | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [blockRect, setBlockRect] = useState<OverlayRect | null>(null);
  const [editingRect, setEditingRect] = useState<OverlayRect | null>(null);
  const [imageRect, setImageRect] = useState<OverlayRect | null>(null);

  const deviceWidth = deviceWidths[device];
  const scale = fitScale(stageSize.width, deviceWidth);
  const frameWidth = deviceWidth * scale;
  const focusMode = mode === "content";
  const iframeHeight = Math.max(
    200,
    Math.floor(
      (stageSize.height -
        frameHeaderHeight -
        stageGutter * 2 -
        frameBorder) /
        scale,
    ),
  );
  const visibleHeight =
    focusMode && focusHeight !== null
      ? Math.min(iframeHeight, Math.max(80, focusHeight))
      : iframeHeight;
  const frameHeight = visibleHeight * scale;
  const bounds = { width: frameWidth, height: frameHeight };

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const observer = new ResizeObserver(() => {
      setStageSize({ width: stage.clientWidth, height: stage.clientHeight });
    });

    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    callbacksRef.current = {
      onSelectBlock,
      onCommit,
      onMove,
      onHide,
      onNavigate,
      onEditText,
    };
    modeRef.current = mode;
    contentRef.current = content;
    pageRef.current = page;
    localeRef.current = locale;
    selectedRef.current = selectedBlockId;
    activeImageRef.current = activeImage;
    scaleRef.current = scale;

    measureRef.current = () => {
      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument;

      if (!iframe || !doc?.body) {
        return;
      }

      const selected = selectedRef.current
        ? findBlockElement(doc, selectedRef.current)
        : null;

      setBlockRect(selected ? rectOf(selected, scaleRef.current) : null);
      setFocusHeight(
        modeRef.current === "content" && selected
          ? Math.ceil(selected.getBoundingClientRect().height)
          : null,
      );

      const editing = editingRef.current;
      setEditingRect(editing ? rectOf(editing.element, scaleRef.current) : null);

      const image = activeImageRef.current;
      const imageSection = image ? findBlockElement(doc, image.blockId) : null;
      const imageElement =
        image && imageSection ? findFieldElement(imageSection, image.field.path) : null;

      setImageRect(imageElement ? rectOf(imageElement, scaleRef.current) : null);
    };
  });

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;

    if (!readyRef.current || !doc?.body) {
      return;
    }

    const changed = syncPreviewSections(doc, content, page, locale);

    patchPreviewFields(doc, page, locale, editingRef.current?.element ?? null);

    if (changed) {
      annotateDocument(doc, content, page, locale);
      refreshIcons(doc);
    }

    paintSelection(doc, focusMode ? null : selectedBlockId);
    paintFocus(doc, focusMode ? selectedBlockId : null);
    measureRef.current();
  }, [content, page, locale, selectedBlockId, focusMode]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;

    if (focusMode && readyRef.current && doc?.body) {
      doc.defaultView?.scrollTo(0, 0);
    }
  }, [focusMode, selectedBlockId]);

  useEffect(() => {
    measureRef.current();
  }, [editingField, activeImage, scale, iframeHeight, deviceWidth]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;

    if (!scrollRequest || !readyRef.current || !doc?.body) {
      return;
    }

    findBlockElement(doc, scrollRequest.blockId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [scrollRequest]);

  function resolveField(
    blockId: string,
    path: (string | number)[],
  ): EditableField | null {
    const block = pageRef.current.blocks.find((candidate) => candidate.id === blockId);

    if (!block) {
      return null;
    }

    return (
      editableFields(block, localeRef.current).find(
        (field) => fieldPathKey(field.path) === fieldPathKey(path),
      ) ?? null
    );
  }

  function commitTextEditing(): void {
    const current = editingRef.current;

    if (!current) {
      return;
    }

    editingRef.current = null;
    current.element.removeAttribute("contenteditable");
    current.element.removeAttribute("data-editor-editing");
    current.element.spellcheck = true;

    const text = current.element.textContent ?? "";
    const value = text.trim();

    if (value !== current.original.trim()) {
      callbacksRef.current.onCommit(current.blockId, current.field.path, value);
    } else if (text !== current.original) {
      current.element.textContent = current.original;
    }

    setEditingField(null);
  }

  function cancelTextEditing(): void {
    const current = editingRef.current;

    if (!current) {
      return;
    }

    editingRef.current = null;
    current.element.removeAttribute("contenteditable");
    current.element.removeAttribute("data-editor-editing");
    current.element.spellcheck = true;
    current.element.textContent = current.original;
    setEditingField(null);
  }

  function startTextEditing(
    blockId: string,
    field: EditableField,
    element: HTMLElement,
  ): void {
    if (editingRef.current?.element === element) {
      return;
    }

    commitTextEditing();
    editingRef.current = { blockId, field, element, original: element.textContent ?? "" };
    element.setAttribute("contenteditable", "true");
    element.setAttribute("data-editor-editing", "true");
    element.spellcheck = false;
    element.focus();
    placeCaretAtEnd(element);
    setActiveImage(null);
    setEditingField(field);
  }

  function hideSelected(): void {
    const blockId = selectedRef.current;

    if (!blockId) {
      return;
    }

    callbacksRef.current.onSelectBlock(null);
    setActiveImage(null);
    callbacksRef.current.onHide(blockId);
  }

  function attachInteractions(doc: Document): void {
    const view = doc.defaultView;

    if (!view) {
      return;
    }

    doc.addEventListener(
      "click",
      (event) => {
        const target = event.target instanceof view.Element ? event.target : null;

        if (!target) {
          return;
        }

        if (editingRef.current?.element.contains(target)) {
          return;
        }

        const fieldElement = target.closest<HTMLElement>("[data-field]");
        const blockElement = target.closest<HTMLElement>("[data-block]");
        const blockId = blockElement?.dataset.block;
        const editable = modeRef.current === "content";

        if (editable && fieldElement && blockId) {
          const path = parseFieldPath(fieldElement.getAttribute("data-field") ?? undefined);
          const field = path ? resolveField(blockId, path) : null;

          if (field) {
            event.preventDefault();

            if (field.kind === "image") {
              commitTextEditing();
              setEditingField(null);
              setActiveImage({ blockId, field });
            } else {
              setActiveImage(null);
              startTextEditing(blockId, field, fieldElement);
            }

            return;
          }
        }

        const anchor = target.closest("a");

        if (anchor) {
          event.preventDefault();
          const link = parseInternalLink(
            anchor.getAttribute("href") ?? "",
            contentRef.current,
          );

          if (link) {
            callbacksRef.current.onNavigate(link.slug, link.locale);
          }

          return;
        }

        if (blockElement) {
          event.preventDefault();
          commitTextEditing();
          setActiveImage(null);

          if (!editable) {
            callbacksRef.current.onSelectBlock(blockElement.dataset.block ?? null);
          }
        }
      },
      true,
    );

    doc.addEventListener(
      "keydown",
      (event) => {
        if (!editingRef.current) {
          return;
        }

        if (event.key === "Enter") {
          event.preventDefault();
          commitTextEditing();
        } else if (event.key === "Escape") {
          event.preventDefault();
          cancelTextEditing();
        }
      },
      true,
    );

    doc.addEventListener(
      "focusout",
      (event) => {
        const current = editingRef.current;

        if (!current) {
          return;
        }

        const next = event.relatedTarget;

        if (next instanceof view.Node && current.element.contains(next)) {
          return;
        }

        commitTextEditing();
      },
      true,
    );

    doc.addEventListener("submit", (event) => event.preventDefault(), true);

    let frame = 0;
    const scheduleMeasure = (): void => {
      if (frame) {
        return;
      }

      frame = view.requestAnimationFrame(() => {
        frame = 0;
        measureRef.current();
      });
    };

    doc.addEventListener("scroll", scheduleMeasure, { passive: true, capture: true });
    view.addEventListener("scroll", scheduleMeasure, { passive: true });
  }

  function handleLoad(): void {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;

    if (!doc?.documentElement) {
      return;
    }

    injectEditorStyle(doc);
    annotateDocument(doc, contentRef.current, pageRef.current, localeRef.current);
    attachInteractions(doc);
    const focusing = modeRef.current === "content";
    paintSelection(doc, focusing ? null : selectedRef.current);
    paintFocus(doc, focusing ? selectedRef.current : null);
    readyRef.current = true;
    measureRef.current();
  }

  const selectedBlock = page.blocks.find((block) => block.id === selectedBlockId) ?? null;
  const visibleBlocks = page.blocks.filter((block) => !block.hidden);
  const selectedVisibleIndex = selectedBlock
    ? visibleBlocks.findIndex((block) => block.id === selectedBlock.id)
    : -1;
  const measured = stageSize.width > 0 && stageSize.height > 0;

  return (
    <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
      <div
        ref={stageRef}
        className="editor-dots h-full w-full overflow-hidden"
      >
        {measured ? (
          <div className="mx-auto w-fit" style={{ padding: stageGutter }}>
            <div className="rounded-xl border border-line shadow-2xl">
              <div className="overflow-hidden rounded-t-xl">
                <CanvasFrameHeader
                  device={device}
                  deviceWidth={deviceWidth}
                  frameHeight={visibleHeight}
                />
              </div>

              <div className="relative" style={{ width: frameWidth, height: frameHeight }}>
                <div className="absolute inset-0 overflow-hidden rounded-b-xl">
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: deviceWidth,
                      height: iframeHeight,
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <iframe
                      ref={iframeRef}
                      title={t("preview.title")}
                      srcDoc={srcDoc}
                      onLoad={handleLoad}
                      className="h-full w-full border-0 bg-white"
                    />
                  </div>
                </div>

        {!focusMode &&
        selectedBlock &&
        blockRect &&
        blockRect.top < frameHeight &&
        blockRect.top + blockRect.height > 0 ? (
          <div
            style={{
              position: "absolute",
              top: clamp(blockRect.top + 8, 8, Math.max(8, frameHeight - 48)),
              left: clamp(blockRect.left + 8, 8, Math.max(8, frameWidth - 300)),
            }}
            className="glass-strong z-30 flex items-center gap-0.5 rounded-full px-1 py-1 text-ink shadow-soft"
          >
            <span className="max-w-[160px] truncate px-2 text-xs text-muted">
              {t(`blocks.${selectedBlock.type}`)}
            </span>

            <button
              type="button"
              onClick={() => callbacksRef.current.onEditText(selectedBlock.id)}
              aria-label={t("section.editText")}
              title={t("section.editText")}
              className="grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.08] hover:text-ink"
            >
              <Icon name="pen" className="h-3.5 w-3.5" />
            </button>

            {selectedVisibleIndex > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => callbacksRef.current.onMove(selectedBlock.id, "up")}
                  disabled={selectedVisibleIndex <= 1}
                  aria-label={t("section.moveUp")}
                  title={t("section.moveUp")}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.08] hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Icon name="chevron" className="h-3.5 w-3.5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => callbacksRef.current.onMove(selectedBlock.id, "down")}
                  disabled={selectedVisibleIndex >= visibleBlocks.length - 1}
                  aria-label={t("section.moveDown")}
                  title={t("section.moveDown")}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.08] hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Icon name="chevron" className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={hideSelected}
                  aria-label={t("section.remove")}
                  title={t("section.remove")}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted transition-colors hover:bg-danger-soft hover:text-danger"
                >
                  <Icon name="trash" className="h-3.5 w-3.5" />
                </button>
              </>
            ) : null}
          </div>
        ) : null}

        {focusMode && editingField && editingRect ? (
          <InlineFieldEditor
            key={`text-${fieldPathKey(editingField.path)}`}
            mode="text"
            field={editingField}
            rect={editingRect}
            bounds={bounds}
          />
        ) : null}

        {focusMode && activeImage && imageRect ? (
          <InlineFieldEditor
            key={`image-${activeImage.blockId}-${fieldPathKey(activeImage.field.path)}`}
            mode="image"
            field={activeImage.field}
            rect={imageRect}
            bounds={bounds}
            onApply={(value) => {
              callbacksRef.current.onCommit(
                activeImage.blockId,
                activeImage.field.path,
                value,
              );
              setActiveImage(null);
            }}
            onCancel={() => setActiveImage(null)}
          />
        ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
