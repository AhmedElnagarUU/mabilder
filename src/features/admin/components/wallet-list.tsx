"use client";

import { useState } from "react";
import { Badge } from "@/shared/ui/badge";
import { buttonClass } from "@/shared/ui/button";
import { Field, labelClass } from "@/shared/ui/field";
import type { PaymentSettings } from "../../billing/settings/types";
import { selectClass } from "./select-class";

export type Wallet = PaymentSettings["wallets"][number];

const walletLabels: Record<Wallet["method"], string> = {
  vodafone_cash: "Vodafone Cash",
  other_wallet: "Other wallet",
};

const emptyWallet: Wallet = { method: "vodafone_cash", number: "", name: "" };

function WalletForm({
  initial,
  busy,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: Wallet;
  busy: boolean;
  submitLabel: string;
  onSubmit: (wallet: Wallet) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(initial);

  return (
    <div className="grid gap-3 sm:grid-cols-[10rem_1fr_1fr] sm:items-end">
      <label className="block">
        <span className={labelClass}>Wallet type</span>
        <select
          value={draft.method}
          onChange={(event) => setDraft({ ...draft, method: event.target.value as Wallet["method"] })}
          className={`${selectClass} w-full`}
        >
          {Object.entries(walletLabels).map(([method, label]) => (
            <option key={method} value={method}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <Field label="Number" value={draft.number} onChange={(number) => setDraft({ ...draft, number })} />
      <Field label="Account name" value={draft.name} onChange={(name) => setDraft({ ...draft, name })} />
      <div className="flex gap-2 sm:col-span-3">
        <button
          type="button"
          disabled={busy || draft.number.trim() === ""}
          onClick={() => onSubmit(draft)}
          className={buttonClass("accent", "sm")}
        >
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className={buttonClass("ghost", "sm")}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function WalletRow({
  wallet,
  busy,
  onEdit,
  onDelete,
}: {
  wallet: Wallet;
  busy: boolean;
  onEdit: (wallet: Wallet) => Promise<boolean>;
  onDelete: () => Promise<boolean>;
}) {
  const [mode, setMode] = useState<"view" | "edit" | "confirm">("view");

  if (mode === "edit") {
    return (
      <WalletForm
        initial={wallet}
        busy={busy}
        submitLabel="Save wallet"
        onCancel={() => setMode("view")}
        onSubmit={async (next) => {
          if (await onEdit(next)) {
            setMode("view");
          }
        }}
      />
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Badge>{walletLabels[wallet.method]}</Badge>
          <bdi dir="ltr" className="text-sm font-medium">
            {wallet.number}
          </bdi>
        </div>
        <p className="mt-1 text-sm text-muted">{wallet.name || "No account name"}</p>
      </div>
      {mode === "confirm" ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Delete this wallet?</span>
          <button type="button" disabled={busy} onClick={() => void onDelete()} className={buttonClass("danger", "sm")}>
            Delete
          </button>
          <button type="button" onClick={() => setMode("view")} className={buttonClass("ghost", "sm")}>
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={() => setMode("edit")} className={buttonClass("secondary", "sm")}>
            Edit
          </button>
          <button type="button" onClick={() => setMode("confirm")} className={buttonClass("danger", "sm")}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export function WalletList({
  wallets,
  busy,
  onChange,
}: {
  wallets: Wallet[];
  busy: boolean;
  onChange: (wallets: Wallet[]) => Promise<boolean>;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {wallets.length === 0 && !adding ? <p className="text-sm text-muted">No wallets saved yet.</p> : null}

      {wallets.map((wallet, index) => (
        <div key={`${index}-${wallet.method}-${wallet.number}`} className="border-b border-line-soft pb-4 last:border-0">
          <WalletRow
            wallet={wallet}
            busy={busy}
            onEdit={(next) => onChange(wallets.map((item, i) => (i === index ? next : item)))}
            onDelete={() => onChange(wallets.filter((_, i) => i !== index))}
          />
        </div>
      ))}

      {adding ? (
        <WalletForm
          initial={emptyWallet}
          busy={busy}
          submitLabel="Add wallet"
          onCancel={() => setAdding(false)}
          onSubmit={async (next) => {
            if (await onChange([...wallets, next])) {
              setAdding(false);
            }
          }}
        />
      ) : (
        <div>
          <button type="button" onClick={() => setAdding(true)} className={buttonClass("secondary", "sm")}>
            Add wallet
          </button>
        </div>
      )}
    </div>
  );
}
