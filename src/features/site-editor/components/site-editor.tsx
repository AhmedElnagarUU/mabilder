"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { Locale } from "../../static-site-generator/locale";
import type { SiteContent } from "../../static-site-generator/site-content";
import {
  editableFields,
  hideBlock,
  moveBlock,
  restoreBlock,
  updateBlockImage,
  updateBlockProp,
} from "../content-ops";
import type { DeviceId, EditorMode } from "../canvas-frame";
import { resolveFocusId, visibleSections } from "../section-nav";
import { fieldPathKey } from "../preview-document";
import { EditorCanvas, type ScrollRequest } from "./editor-canvas";
import { EditorTopbar, type EditorDrawer } from "./editor-topbar";
import { FocusBar } from "./focus-bar";
import { PagePanel } from "./page-panel";
import { PanelRail } from "./panel-toggle";
import { SectionList } from "./section-list";
import { useEditorMode } from "./use-editor-mode";
import { usePanelOpen } from "./use-panel-open";
import { SaveToast, type SaveToastMessage } from "./save-toast";

type SiteEditorProps = {
  siteId: string;
  content: SiteContent;
};

export function SiteEditor({ siteId, content: initialContent }: SiteEditorProps) {
  const t = useTranslations("editor");
  const [content, setContent] = useState(initialContent);
  const [pageId, setPageId] = useState(initialContent.pages[0].id);
  const [locale, setLocale] = useState<Locale>(initialContent.defaultLocale);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);
  const [toast, setToast] = useState<SaveToastMessage | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [scrollRequest, setScrollRequest] = useState<ScrollRequest | null>(null);
  const [device, setDevice] = useState<DeviceId>("desktop");
  const [mode, setMode] = useEditorMode();
  const [leftOpen, setLeftOpen] = usePanelOpen("editor.leftPanel");
  const [rightOpen, setRightOpen] = usePanelOpen("editor.rightPanel");
  const [drawer, setDrawer] = useState<EditorDrawer | null>(null);

  const contentRef = useRef(content);
  const revisionRef = useRef(0);
  const attemptedRef = useRef(0);
  const savingRef = useRef(false);

  const page = content.pages.find((candidate) => candidate.id === pageId) ?? content.pages[0];

  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const showToast = useCallback(
    (kind: SaveToastMessage["kind"], message: string): void => {
      setToast({ id: Date.now(), kind, message });
    },
    [],
  );

  const saveContent = useCallback(async (): Promise<boolean> => {
    if (savingRef.current) {
      return false;
    }

    savingRef.current = true;
    setSaving(true);

    const payload = contentRef.current;
    const startedRevision = revisionRef.current;
    attemptedRef.current = startedRevision;

    try {
      const response = await fetch(`/api/sites/${siteId}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.status === 400) {
        showToast("error", t("errors.invalid"));
        return false;
      }

      if (!response.ok) {
        showToast("error", t("errors.saveFailed"));
        return false;
      }

      if (revisionRef.current === startedRevision) {
        setDirty(false);
        showToast("success", t("panel.saved"));
      }

      return true;
    } catch {
      showToast("error", t("errors.saveFailed"));
      return false;
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [showToast, siteId, t]);

  useEffect(() => {
    if (!dirty || saving || attemptedRef.current >= revision) {
      return;
    }

    const timer = setTimeout(() => {
      void saveContent();
    }, 900);

    return () => clearTimeout(timer);
  }, [dirty, revision, saveContent, saving]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!dirty) {
      return;
    }

    function warnBeforeLeaving(event: BeforeUnloadEvent): void {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [dirty]);

  function apply(next: SiteContent): void {
    if (next === contentRef.current) {
      return;
    }

    contentRef.current = next;
    setContent(next);
    revisionRef.current += 1;
    setRevision(revisionRef.current);
    setDirty(true);
  }

  function handleCommit(
    blockId: string,
    path: (string | number)[],
    value: string,
  ): void {
    const current = contentRef.current;
    const currentPage = current.pages.find((candidate) => candidate.id === page.id);
    const block = currentPage?.blocks.find((candidate) => candidate.id === blockId);

    if (!currentPage || !block) {
      return;
    }

    const field = editableFields(block, locale).find(
      (candidate) => fieldPathKey(candidate.path) === fieldPathKey(path),
    );

    if (!field) {
      return;
    }

    const next =
      field.kind === "image"
        ? updateBlockImage(current, currentPage.id, blockId, locale, field.path, value)
        : updateBlockProp(current, currentPage.id, blockId, locale, field.path, value);

    apply(next);
  }

  function handleMove(blockId: string, direction: "up" | "down"): void {
    apply(moveBlock(contentRef.current, page.id, blockId, direction));
  }

  function handleSelectBlock(blockId: string | null): void {
    setSelectedBlockId(blockId);
  }

  function handleHide(blockId: string): void {
    if (blockId === selectedBlockId) {
      handleSelectBlock(null);
    }

    apply(hideBlock(contentRef.current, page.id, blockId));
  }

  function changeMode(next: EditorMode): void {
    setMode(next);
    setDrawer(null);
  }

  function handleSelectMode(next: EditorMode): void {
    if (next === "content" && !selectedBlockId) {
      setSelectedBlockId(visibleSections(page.blocks)[0]?.id ?? null);
    }

    changeMode(next);
  }

  function handleEditText(blockId: string): void {
    handleSelectBlock(blockId);
    changeMode("content");
  }

  function handleListSelect(blockId: string): void {
    handleSelectBlock(blockId);
    setScrollRequest({ blockId, nonce: Date.now() });
  }

  function handleSelectPage(nextPageId: string): void {
    handleSelectBlock(null);
    setPageId(nextPageId);
    setDrawer(null);
  }

  function toggleDrawer(next: EditorDrawer): void {
    setDrawer((current) => (current === next ? null : next));
  }

  async function saveBeforeSwitchingLanguage(): Promise<boolean> {
    if (!dirty) {
      return true;
    }

    return saveContent();
  }

  function handleRestore(blockId: string): void {
    apply(restoreBlock(contentRef.current, page.id, blockId));
  }

  function handleSelectLocale(nextLocale: Locale): void {
    if (content.locales.includes(nextLocale)) {
      handleSelectBlock(null);
      setLocale(nextLocale);
    }
  }

  function handleNavigate(pageSlug: string, nextLocale?: Locale): void {
    const nextPage = contentRef.current.pages.find(
      (candidate) => candidate.slug === pageSlug,
    );

    if (nextPage) {
      handleSelectBlock(null);
      setPageId(nextPage.id);
    }

    if (nextLocale && contentRef.current.locales.includes(nextLocale)) {
      handleSelectBlock(null);
      setLocale(nextLocale);
    }
  }

  const structure = mode === "structure";
  const focusId = resolveFocusId(page.blocks, selectedBlockId);
  const canvasSelectedId = structure ? selectedBlockId : focusId;
  const leftLg = leftOpen ? "lg:static lg:z-auto lg:flex" : "lg:hidden";
  const rightLg = rightOpen ? "lg:static lg:z-auto lg:flex" : "lg:hidden";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <EditorTopbar
        businessName={content.facts.businessName}
        pageSlug={page.slug}
        mode={mode}
        device={device}
        dirty={dirty}
        saving={saving}
        onSave={() => void saveContent()}
        onBeforeSwitchLocale={saveBeforeSwitchingLanguage}
        onToggleDrawer={toggleDrawer}
        onSelectMode={handleSelectMode}
        onSelectDevice={setDevice}
      />

      {structure ? null : (
        <FocusBar
          content={content}
          page={page}
          locale={locale}
          focusId={focusId}
          onBack={() => handleSelectMode("structure")}
          onSelectBlock={handleSelectBlock}
          onSelectPage={handleSelectPage}
          onSelectLocale={handleSelectLocale}
        />
      )}

      <div className="relative flex min-h-0 flex-1">
        {drawer ? (
          <button
            type="button"
            onClick={() => setDrawer(null)}
            aria-label={t("panel.collapse")}
            className="fixed inset-x-0 top-12 bottom-0 z-30 bg-black/50 lg:hidden"
          />
        ) : null}

        {structure ? (
          <>
            <div
              className={`shrink-0 ${leftLg} ${
                drawer === "sections" ? "fixed start-0 top-12 bottom-0 z-40 flex" : "hidden"
              }`}
            >
              <SectionList
                page={page}
                selectedBlockId={selectedBlockId}
                onSelect={handleListSelect}
                onEditText={handleEditText}
                onMove={handleMove}
                onHide={handleHide}
                onRestore={handleRestore}
                onCollapse={() => setLeftOpen(false)}
              />
            </div>
            {leftOpen ? null : <PanelRail side="start" onShow={() => setLeftOpen(true)} />}
          </>
        ) : null}

        <EditorCanvas
          key={`${page.id}:${locale}`}
          siteId={siteId}
          content={content}
          page={page}
          locale={locale}
          mode={mode}
          selectedBlockId={canvasSelectedId}
          device={device}
          scrollRequest={scrollRequest}
          onSelectBlock={handleSelectBlock}
          onCommit={handleCommit}
          onMove={handleMove}
          onHide={handleHide}
          onNavigate={handleNavigate}
          onEditText={handleEditText}
        />

        {structure ? (
          <>
            {rightOpen ? null : <PanelRail side="end" onShow={() => setRightOpen(true)} />}
            <div
              className={`shrink-0 ${rightLg} ${
                drawer === "pages" ? "fixed end-0 top-12 bottom-0 z-40 flex" : "hidden"
              }`}
            >
              <PagePanel
                content={content}
                page={page}
                locale={locale}
                onSelectPage={handleSelectPage}
                onSelectLocale={handleSelectLocale}
                onCollapse={() => setRightOpen(false)}
              />
            </div>
          </>
        ) : null}
      </div>

      <SaveToast toast={toast} />
    </div>
  );
}