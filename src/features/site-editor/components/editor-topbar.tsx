"use client";

import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "../../../shared/i18n/locale-switcher";
import { Link } from "../../../shared/i18n/navigation";
import { buttonClass } from "../../../shared/ui/button";
import { Icon, type IconName } from "../../../shared/ui/icon";
import { deviceIds, type DeviceId, type EditorMode } from "../canvas-frame";

export type EditorDrawer = "sections" | "pages";

const deviceIcons: Record<DeviceId, IconName> = {
  desktop: "monitor",
  tablet: "tablet",
  mobile: "phone",
};

const modeIcons: Record<EditorMode, IconName> = {
  structure: "layout",
  content: "pen",
};

const modeIds: EditorMode[] = ["structure", "content"];

type EditorTopbarProps = {
  businessName: string;
  pageSlug: string;
  mode: EditorMode;
  device: DeviceId;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onBeforeSwitchLocale: () => Promise<boolean>;
  onToggleDrawer: (drawer: EditorDrawer) => void;
  onSelectMode: (mode: EditorMode) => void;
  onSelectDevice: (device: DeviceId) => void;
};

type SegmentedProps<Id extends string> = {
  ariaLabel: string;
  ids: Id[];
  value: Id;
  icons: Record<Id, IconName>;
  label: (id: Id) => string;
  labelClass: string;
  onSelect: (id: Id) => void;
};

function Segmented<Id extends string>({
  ariaLabel,
  ids,
  value,
  icons,
  label,
  labelClass,
  onSelect,
}: SegmentedProps<Id>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex rounded-full border border-line bg-white/[0.025] p-0.5"
    >
      {ids.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          aria-pressed={id === value}
          aria-label={label(id)}
          title={label(id)}
          className={`flex h-8 items-center gap-1.5 rounded-full px-2 text-xs transition-colors sm:px-2.5 ${
            id === value ? "bg-white/[0.1] text-ink" : "text-muted hover:text-ink"
          }`}
        >
          <Icon name={icons[id]} className="h-4 w-4" />
          <span className={labelClass}>{label(id)}</span>
        </button>
      ))}
    </div>
  );
}

export function EditorTopbar({
  businessName,
  pageSlug,
  mode,
  device,
  dirty,
  saving,
  onSave,
  onBeforeSwitchLocale,
  onToggleDrawer,
  onSelectMode,
  onSelectDevice,
}: EditorTopbarProps) {
  const t = useTranslations("editor");
  const saveLabel = saving
    ? t("panel.saving")
    : dirty
      ? t("panel.save")
      : t("panel.saved");

  function renderControls(labelClass: string) {
    return (
      <>
        <Segmented
          ariaLabel={t("modes.label")}
          ids={modeIds}
          value={mode}
          icons={modeIcons}
          label={(id) => t(`modes.${id}`)}
          labelClass={labelClass}
          onSelect={onSelectMode}
        />
        <Segmented
          ariaLabel={t("devices.label")}
          ids={deviceIds}
          value={device}
          icons={deviceIcons}
          label={(id) => t(`devices.${id}`)}
          labelClass="hidden lg:inline"
          onSelect={onSelectDevice}
        />
      </>
    );
  }

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-line bg-surface px-2 sm:px-3 md:grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            href="/dashboard"
            aria-label={t("panel.back")}
            title={t("panel.back")}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line text-soft transition-colors hover:bg-white/[0.06]"
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180 rtl:rotate-0" />
          </Link>
          <p className="hidden min-w-0 truncate text-sm font-medium text-ink sm:block">
            {businessName}
          </p>
        </div>

        <div className="hidden min-w-0 items-center gap-3 md:flex">
          <p className="truncate text-sm text-muted">{t(`pages.${pageSlug}`)}</p>
          {renderControls("hidden lg:inline")}
        </div>

        <div className="flex items-center justify-end gap-1.5 sm:gap-2">
          {mode === "structure" ? (
            <>
              <button
                type="button"
                onClick={() => onToggleDrawer("sections")}
                aria-label={t("panel.sections")}
                title={t("panel.sections")}
                className={buttonClass("secondary", "sm", "px-0 max-sm:w-9 sm:px-3 lg:hidden")}
              >
                <Icon name="layers" className="h-4 w-4 sm:hidden" />
                <span className="max-sm:hidden">{t("panel.sections")}</span>
              </button>
              <button
                type="button"
                onClick={() => onToggleDrawer("pages")}
                aria-label={t("panel.pagesTitle")}
                title={t("panel.pagesTitle")}
                className={buttonClass("secondary", "sm", "px-0 max-sm:w-9 sm:px-3 lg:hidden")}
              >
                <Icon name="pages" className="h-4 w-4 sm:hidden" />
                <span className="max-sm:hidden">{t("panel.pagesTitle")}</span>
              </button>
            </>
          ) : null}
          <LocaleSwitcher
            className={buttonClass("secondary", "sm", "px-3 sm:px-3.5")}
            beforeSwitch={onBeforeSwitchLocale}
          />
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            title={dirty ? t("panel.unsaved") : undefined}
            className={buttonClass("primary", "sm", "px-3 sm:px-3.5")}
          >
            {dirty && !saving ? (
              <span className="h-1.5 w-1.5 rounded-full bg-accent-strong" />
            ) : null}
            {saveLabel}
          </button>
        </div>
      </header>

      <div className="flex h-11 shrink-0 items-center justify-center gap-3 border-b border-line bg-surface md:hidden">
        {renderControls("inline")}
      </div>
    </>
  );
}
