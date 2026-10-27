import { labelFor } from "../content/labels";
import {
  isContentObject,
  type ContentNode,
  type ContentPath,
} from "../content/content-tree";
import { inputClass, labelClass } from "@/shared/ui/field";

type ChangeHandler = (path: ContentPath, value: ContentNode) => void;

type ArrayActions = {
  addItem: (path: ContentPath) => void;
  removeItem: (path: ContentPath, index: number) => void;
  moveItem: (path: ContentPath, index: number, offset: number) => void;
};

type GroupProps = {
  value: ContentNode;
  path: ContentPath;
  onChange: ChangeHandler;
  actions: ArrayActions;
};

type NodeProps = GroupProps & {
  name: string;
  hideLabel?: boolean;
};

type ListProps = NodeProps & {
  value: ContentNode[];
};

const longTextKeys = new Set([
  "body",
  "paragraphs",
  "quote",
  "bio",
  "answer",
  "intro",
  "blurb",
  "caption",
  "consent",
  "directions",
  "note",
  "noteBody",
  "successMessage",
  "replyNote",
  "requiredNote",
  "description",
  "text",
  "author",
  "messagePlaceholder",
]);

function isLongText(name: string, value: string): boolean {
  return longTextKeys.has(name) || value.length > 90 || value.includes("\n");
}

function itemTitle(item: ContentNode, index: number): string {
  if (typeof item === "string") {
    return item.trim() || `Item ${index + 1}`;
  }

  if (isContentObject(item)) {
    for (const key of [
      "title",
      "name",
      "label",
      "question",
      "year",
      "value",
      "eyebrow",
      "tag",
      "city",
    ]) {
      const candidate = item[key];

      if (typeof candidate === "string" && candidate.trim()) {
        return candidate;
      }
    }
  }

  return `Item ${index + 1}`;
}

function StringField({
  name,
  value,
  path,
  onChange,
  hideLabel = false,
}: {
  name: string;
  value: string;
  path: ContentPath;
  onChange: ChangeHandler;
  hideLabel?: boolean;
}) {
  const long = isLongText(name, value);

  return (
    <div>
      <label className="block">
        {hideLabel ? null : (
          <span className={labelClass}>{labelFor(name)}</span>
        )}
        {long ? (
          <textarea
            value={value}
            rows={Math.min(8, Math.max(3, value.split("\n").length + 1))}
            onChange={(event) => onChange(path, event.target.value)}
            className={`${inputClass} resize-y`}
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(path, event.target.value)}
            className={inputClass}
          />
        )}
      </label>

      {name === "src" && /^https?:\/\//.test(value) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mt-2 h-20 w-32 rounded-lg border border-line object-cover"
        />
      ) : null}

      {name === "href" || name.endsWith("Href") ? (
        <p className="mt-1 text-[11px] text-muted">
          Page name, #section, mailto:, tel:, or https://
        </p>
      ) : null}

      {name === "icon" ? (
        <p className="mt-1 text-[11px] text-muted">
          Lucide icon name, for example mail or building-2
        </p>
      ) : null}

      {name === "body" || name === "paragraphs" ? (
        <p className="mt-1 text-[11px] text-muted">
          Use *text* for italic. Line breaks are kept.
        </p>
      ) : null}
    </div>
  );
}

function ListEditor({
  name,
  value,
  path,
  onChange,
  actions,
  hideLabel = false,
}: ListProps) {
  return (
    <div
      className={
        hideLabel
          ? "space-y-3"
          : "space-y-3 rounded-panel border border-line bg-panel/70 p-4"
      }
    >
      <div className="flex items-center justify-between gap-3">
        {hideLabel ? (
          <p className="text-xs text-muted">
            {value.length} {value.length === 1 ? "item" : "items"}
          </p>
        ) : (
          <p className="text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
            {labelFor(name)}
          </p>
        )}
        <button
          type="button"
          onClick={() => actions.addItem(path)}
          className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-accent/40 hover:bg-accent-soft"
        >
          + Add
        </button>
      </div>

      <div className="space-y-3">
        {value.map((item, index) => (
          <div
            key={index}
            className="rounded-panel border border-line bg-surface p-4 shadow-soft"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-xs font-semibold text-ink">
                {itemTitle(item, index)}
              </p>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => actions.moveItem(path, index, -1)}
                  disabled={index === 0}
                  className="rounded-full border border-line px-2 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move item up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => actions.moveItem(path, index, 1)}
                  disabled={index === value.length - 1}
                  className="rounded-full border border-line px-2 py-1 text-xs text-muted transition-colors hover:border-accent/40 hover:text-ink disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Move item down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => actions.removeItem(path, index)}
                  className="rounded-full border border-danger/25 px-2.5 py-1 text-xs text-danger transition-colors hover:bg-danger-soft"
                >
                  Remove
                </button>
              </div>
            </div>

            {typeof item === "string" ? (
              <StringField
                name={name}
                value={item}
                path={[...path, index]}
                onChange={onChange}
                hideLabel
              />
            ) : (
              <Fields
                value={item}
                path={[...path, index]}
                onChange={onChange}
                actions={actions}
              />
            )}
          </div>
        ))}

        {value.length === 0 ? (
          <p className="text-xs text-muted">No items yet. Use the Add button.</p>
        ) : null}
      </div>
    </div>
  );
}

function NodeEditor({
  name,
  value,
  path,
  onChange,
  actions,
  hideLabel = false,
}: NodeProps) {
  if (name === "variant" && typeof value === "string") {
    return (
      <label className="block">
        <span className={labelClass}>{labelFor(name)}</span>
        <select
          value={value}
          onChange={(event) => onChange(path, event.target.value)}
          className={inputClass}
        >
          <option value="dark">Dark</option>
          <option value="split">Split</option>
          <option value="sand">Sand</option>
        </select>
      </label>
    );
  }

  if (typeof value === "string") {
    return (
      <StringField
        name={name}
        value={value}
        path={path}
        onChange={onChange}
        hideLabel={hideLabel}
      />
    );
  }

  if (Array.isArray(value)) {
    return (
      <ListEditor
        name={name}
        value={value}
        path={path}
        onChange={onChange}
        actions={actions}
        hideLabel={hideLabel}
      />
    );
  }

  return (
    <div
      className={
        hideLabel ? "" : "rounded-panel border border-line bg-panel/70 p-4"
      }
    >
      {hideLabel ? null : (
        <p className="mb-3 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase">
          {labelFor(name)}
        </p>
      )}
      <Fields value={value} path={path} onChange={onChange} actions={actions} />
    </div>
  );
}

export function Fields({ value, path, onChange, actions }: GroupProps) {
  if (!isContentObject(value)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {Object.entries(value).map(([key, child]) => (
        <NodeEditor
          key={key}
          name={key}
          value={child}
          path={[...path, key]}
          onChange={onChange}
          actions={actions}
        />
      ))}
    </div>
  );
}

export function SectionList({ value, path, onChange, actions }: GroupProps) {
  if (!isContentObject(value)) {
    return null;
  }

  return (
    <div className="space-y-5">
      {Object.entries(value).map(([key, child]) => (
        <section
          key={key}
          className="overflow-hidden rounded-card border border-line bg-surface shadow-soft"
        >
          <header className="border-b border-line bg-panel/80 px-5 py-3">
            <h2 className="text-sm font-semibold text-ink">{labelFor(key)}</h2>
          </header>
          <div className="p-5">
            <NodeEditor
              name={key}
              value={child}
              path={[...path, key]}
              onChange={onChange}
              actions={actions}
              hideLabel
            />
          </div>
        </section>
      ))}
    </div>
  );
}
