"use client";

import { useTranslations } from "next-intl";
import { Icon } from "../../../shared/ui/icon";
import type { Page } from "../../static-site-generator/site-content";
import { PanelToggle } from "./panel-toggle";

type SectionListProps = {
  page: Page;
  selectedBlockId: string | null;
  onSelect: (blockId: string) => void;
  onEditText: (blockId: string) => void;
  onMove: (blockId: string, direction: "up" | "down") => void;
  onHide: (blockId: string) => void;
  onRestore: (blockId: string) => void;
  onCollapse: () => void;
  onRewritePage: () => void;
};

const iconButtonClass =
  "grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-white/[0.08] hover:text-ink disabled:cursor-not-allowed disabled:opacity-30";

export function SectionList({
  page,
  selectedBlockId,
  onSelect,
  onEditText,
  onMove,
  onHide,
  onRestore,
  onCollapse,
  onRewritePage,
}: SectionListProps) {
  const t = useTranslations("editor");
  const visible = page.blocks.filter((block) => !block.hidden);
  const removed = page.blocks.filter((block) => block.hidden);

  return (
    <aside data-tour="editor-sections" className="w-[260px] shrink-0 space-y-5 overflow-y-auto border-e border-line bg-surface px-3 py-3">
      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="mono-label truncate text-[13px] tracking-[0.12em] text-faint">
            {t("panel.sections")}
          </p>
          <PanelToggle direction="start" onClick={onCollapse} />
        </div>
        <button
          type="button"
          onClick={onRewritePage}
          data-tour="editor-rewrite"
          className="mb-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 text-sm text-accent transition-colors hover:bg-accent/15"
        >
          <Icon name="spark" className="h-4 w-4" />
          {t("rewrite.openPage")}
        </button>
        <ul className="space-y-1">
          {visible.map((block, visibleIndex) => {
            const selected = block.id === selectedBlockId;
            const actionsClass = selected
              ? "opacity-100"
              : "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 max-lg:opacity-100";

            return (
              <li
                key={block.id}
                className={`group flex items-center gap-0.5 rounded-lg ps-2 pe-1 transition-colors ${
                  selected ? "bg-accent/10" : "hover:bg-white/[0.04]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(block.id)}
                  aria-current={selected ? "true" : undefined}
                  className={`min-w-0 flex-1 truncate py-2 text-start text-[15px] ${
                    selected ? "text-accent" : "text-muted group-hover:text-ink"
                  }`}
                >
                  {t(`blocks.${block.type}`)}
                </button>

                <div className={`flex items-center gap-0.5 ${actionsClass}`}>
                  <button
                    type="button"
                    onClick={() => onEditText(block.id)}
                    aria-label={t("section.editText")}
                    title={t("section.editText")}
                    className={iconButtonClass}
                  >
                    <Icon name="pen" className="h-3.5 w-3.5" />
                  </button>
                  {visibleIndex > 0 ? (
                    <>
                    <button
                      type="button"
                      onClick={() => onMove(block.id, "up")}
                      disabled={visibleIndex <= 1}
                      aria-label={t("section.moveUp")}
                      title={t("section.moveUp")}
                      className={iconButtonClass}
                    >
                      <Icon name="chevron" className="h-3.5 w-3.5 rotate-180" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMove(block.id, "down")}
                      disabled={visibleIndex >= visible.length - 1}
                      aria-label={t("section.moveDown")}
                      title={t("section.moveDown")}
                      className={iconButtonClass}
                    >
                      <Icon name="chevron" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onHide(block.id)}
                      aria-label={t("section.remove")}
                      title={t("section.remove")}
                      className={`${iconButtonClass} hover:!bg-danger-soft hover:!text-danger`}
                    >
                      <Icon name="trash" className="h-3.5 w-3.5" />
                    </button>
                    </>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {removed.length > 0 ? (
        <section>
          <p className="mono-label mb-2 text-[13px] tracking-[0.12em] text-faint">
            {t("section.removed")}
          </p>
          <ul className="space-y-1.5">
            {removed.map((block) => (
              <li
                key={block.id}
                className="flex items-center gap-2 rounded-lg border border-line-soft bg-white/[0.015] px-2 py-1.5"
              >
                <span className="min-w-0 flex-1 truncate text-[15px] text-faint">
                  {t(`blocks.${block.type}`)}
                </span>
                <button
                  type="button"
                  onClick={() => onRestore(block.id)}
                  className="h-7 shrink-0 rounded-md px-2 text-sm text-accent transition-colors hover:bg-accent/10"
                >
                  {t("section.restore")}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
