"use client";

import { useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { toWhatsAppDigits } from "@/features/static-site-generator/content/whatsapp";
import { useRouter } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";
import { Icon } from "@/shared/ui/icon";
import { inquiryStatuses, type InquiryItem, type InquiryStatus } from "../types";
import { sendInquiryRequest } from "./inquiry-request";

type Filter = "all" | InquiryStatus | "spam";

const filters: Filter[] = ["all", ...inquiryStatuses, "spam"];

function matchesFilter(item: InquiryItem, filter: Filter): boolean {
  if (filter === "spam") {
    return item.spam;
  }

  return !item.spam && (filter === "all" || item.status === filter);
}

const selectClass =
  "h-10 rounded-xl border border-line bg-white/[0.025] px-3 text-sm text-ink outline-none transition [color-scheme:dark] focus:border-accent/45 [&>option]:bg-panel [&>option]:text-ink";

export function InboxList({ siteId, items }: { siteId: string; items: InquiryItem[] }) {
  const t = useTranslations("inbox");
  const errors = useTranslations("inbox.errors");
  const format = useFormatter();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const visible = items.filter((item) => matchesFilter(item, filter));
  const selected = visible.find((item) => item.id === selectedId) ?? null;
  const base = `/api/sites/${siteId}/inquiries`;

  async function run(request: () => Promise<string | null>): Promise<boolean> {
    setBusy(true);
    setError("");

    const failure = await request();

    setBusy(false);

    if (failure) {
      setError(errors(failure));
      return false;
    }

    router.refresh();
    return true;
  }

  function update(item: InquiryItem, body: { status?: InquiryStatus; spam?: boolean }) {
    return run(() => sendInquiryRequest(`${base}/${item.id}`, "PATCH", body));
  }

  async function remove(item: InquiryItem): Promise<void> {
    if (await run(() => sendInquiryRequest(`${base}/${item.id}`, "DELETE"))) {
      setDeleting(false);
      setSelectedId(null);
    }
  }

  function formatDate(value: string): string {
    return format.dateTime(new Date(value), { dateStyle: "medium", timeStyle: "short" });
  }

  function countFor(value: Filter): number {
    return items.filter((item) => matchesFilter(item, value)).length;
  }

  return (
    <div className="space-y-4">
      <div role="tablist" data-tour="inbox-filters" aria-label={t("filters.aria")} className="flex flex-wrap gap-2">
        {filters.map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={filter === value}
            onClick={() => {
              setFilter(value);
              setSelectedId(null);
            }}
            className={buttonClass(filter === value ? "primary" : "secondary", "sm", "gap-1.5")}
          >
            {t(`filters.${value}`)}
            <span className="text-xs opacity-70">{countFor(value)}</span>
          </button>
        ))}
      </div>

      {error ? <p role="alert" className="text-sm text-danger">{error}</p> : null}

      {visible.length === 0 ? (
        <Card className="px-6 py-12 text-center">
          <Icon name="inbox" className="mx-auto h-6 w-6 text-faint" />
          <p className="mt-3 text-base text-ink">{t(items.length === 0 ? "empty.title" : "empty.filtered")}</p>
          {items.length === 0 ? <p className="mx-auto mt-1 max-w-md text-sm text-muted">{t("empty.body")}</p> : null}
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <ul aria-label={t("list.aria")} className="space-y-2">
            {visible.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-current={item.id === selectedId}
                  className={`w-full rounded-panel border p-3.5 text-start transition ${
                    item.id === selectedId ? "border-accent/45 bg-white/[0.05]" : "border-line-soft hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-base font-medium text-ink">{item.name}</span>
                    <Badge tone={item.spam ? "danger" : item.status === "new" ? "success" : "neutral"}>
                      {item.spam ? t("filters.spam") : t(`status.${item.status}`)}
                    </Badge>
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted">
                    <bdi dir="ltr">{item.phone}</bdi>
                    {item.service ? ` · ${item.service}` : ""}
                  </span>
                  <span className="mt-1 block text-xs text-faint">{formatDate(item.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="h-fit">
            <Card className="p-5">
              {selected ? (
                <InquiryDetails
                  item={selected}
                  busy={busy}
                  date={formatDate(selected.createdAt)}
                  onUpdate={(body) => void update(selected, body)}
                  onDelete={() => setDeleting(true)}
                />
              ) : (
                <p className="text-sm text-muted">{t("details.selectHint")}</p>
              )}
            </Card>
          </div>
        </div>
      )}

      {deleting && selected ? (
        <ConfirmDialog
          title={t("delete.title")}
          description={t("delete.body")}
          confirmLabel={t("delete.confirm")}
          cancelLabel={t("delete.cancel")}
          busy={busy}
          danger
          onConfirm={() => void remove(selected)}
          onCancel={() => setDeleting(false)}
          onDismiss={() => setDeleting(false)}
        />
      ) : null}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) {
    return null;
  }

  return (
    <div className="py-2">
      <dt className="font-mono text-[11px] tracking-[0.1em] text-muted uppercase">{label}</dt>
      <dd className="mt-0.5 text-sm whitespace-pre-wrap text-ink">{value}</dd>
    </div>
  );
}

function InquiryDetails({
  item,
  busy,
  date,
  onUpdate,
  onDelete,
}: {
  item: InquiryItem;
  busy: boolean;
  date: string;
  onUpdate: (body: { status?: InquiryStatus; spam?: boolean }) => void;
  onDelete: () => void;
}) {
  const t = useTranslations("inbox");
  const digits = toWhatsAppDigits(item.phone);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-medium text-ink">{item.name}</h2>
          <p className="text-xs text-faint">{date}</p>
        </div>
        {item.spam ? <Badge tone="danger">{t("filters.spam")}</Badge> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <a href={`tel:${item.phone}`} className={buttonClass("primary", "sm", "gap-1.5")}>
          <Icon name="phone" className="h-3.5 w-3.5" />
          {t("details.call")}
        </a>
        {digits ? (
          <a
            href={`https://wa.me/${digits}`}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass("secondary", "sm", "gap-1.5")}
          >
            {t("details.whatsapp")}
          </a>
        ) : null}
      </div>

      <dl className="mt-3 divide-y divide-line-soft">
        <Detail label={t("fields.phone")} value={item.phone} />
        <Detail label={t("fields.email")} value={item.email} />
        <Detail label={t("fields.service")} value={item.service} />
        <Detail label={t("fields.location")} value={item.location} />
        <Detail label={t("fields.budget")} value={item.budget ? t(`budget.${item.budget}`) : undefined} />
        <Detail label={t("fields.startWhen")} value={item.startWhen ? t(`start.${item.startWhen}`) : undefined} />
        <Detail label={t("fields.message")} value={item.message} />
        {item.spamReason ? <Detail label={t("fields.spamReason")} value={t(`spamReasons.${item.spamReason}`)} /> : null}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-soft pt-4">
        <label className="flex items-center gap-2 text-sm text-muted">
          {t("details.status")}
          <select
            value={item.status}
            disabled={busy}
            onChange={(event) => onUpdate({ status: event.target.value as InquiryStatus })}
            className={selectClass}
          >
            {inquiryStatuses.map((status) => (
              <option key={status} value={status}>
                {t(`status.${status}`)}
              </option>
            ))}
          </select>
        </label>

        <span className="ms-auto flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onUpdate({ spam: !item.spam })}
            className={buttonClass("secondary", "sm")}
          >
            {item.spam ? t("details.notSpam") : t("details.markSpam")}
          </button>
          <button type="button" disabled={busy} onClick={onDelete} className={buttonClass("danger", "sm", "gap-1.5")}>
            <Icon name="trash" className="h-3.5 w-3.5" />
            {t("details.delete")}
          </button>
        </span>
      </div>
    </div>
  );
}
