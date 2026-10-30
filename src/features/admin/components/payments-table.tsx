import { Link } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import type { PaymentListQuery, PaymentStatus } from "../../billing/payments/types";
import type { AdminPaymentList } from "../types";
import { formatDateTime } from "./format";
import { PaymentActions } from "./payment-actions";
import { selectClass } from "./select-class";

const cellClass = "px-4 py-3 text-start text-sm align-top";

const methodLabels = {
  vodafone_cash: "Vodafone Cash",
  instapay: "InstaPay",
  other_wallet: "Other wallet",
};

const statusTones: Record<PaymentStatus, "warn" | "success" | "danger"> = {
  pending: "warn",
  approved: "success",
  rejected: "danger",
};

export function PaymentsFilters({ query }: { query: PaymentListQuery }) {
  return (
    <Card className="mb-4 p-4">
      <form method="get" className="flex flex-wrap items-center gap-3">
        <select name="status" defaultValue={query.status ?? ""} aria-label="Status" className={selectClass}>
          <option value="">Pending first, then history</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className={buttonClass("secondary", "md")}>
          Apply
        </button>
      </form>
    </Card>
  );
}

export function PaymentsTable({ payments }: { payments: AdminPaymentList }) {
  const { items, expectedPriceEgp } = payments;

  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[960px]">
        <thead>
          <tr className="border-b border-line font-mono text-[11px] tracking-[0.1em] text-muted uppercase">
            <th className={cellClass}>User</th>
            <th className={cellClass}>Method</th>
            <th className={cellClass}>Amount</th>
            <th className={cellClass}>Reference</th>
            <th className={cellClass}>Sender phone</th>
            <th className={cellClass}>Sent</th>
            <th className={cellClass}>Status</th>
          </tr>
        </thead>
        <tbody>
          {items.map((payment) => (
            <tr key={payment.id} className="border-b border-line-soft last:border-0">
              <td className={cellClass}>
                <Link href={`/admin/users/${payment.userId}`} className="font-medium text-ink underline decoration-line underline-offset-4">
                  {payment.userName || "(no name)"}
                </Link>
                <p className="text-xs text-muted">{payment.userEmail}</p>
              </td>
              <td className={cellClass}>{methodLabels[payment.method]}</td>
              <td className={cellClass}>
                {payment.amount} {payment.currency}
                <p className="text-xs text-muted">
                  Expected: {expectedPriceEgp === null ? "not set" : `${expectedPriceEgp} EGP`}
                </p>
              </td>
              <td className={cellClass}>
                {payment.reference ?? "-"}
                {payment.proofImageUrl ? (
                  <a
                    href={payment.proofImageUrl}
                    target="_blank"
                    rel="noopener"
                    className="mt-1 block text-xs text-accent underline underline-offset-4"
                  >
                    View screenshot
                  </a>
                ) : null}
              </td>
              <td className={cellClass}>{payment.senderPhone ?? "-"}</td>
              <td className={cellClass}>{formatDateTime(payment.createdAt)}</td>
              <td className={cellClass}>
                {payment.status === "pending" ? (
                  <PaymentActions paymentId={payment.id} />
                ) : (
                  <>
                    <Badge tone={statusTones[payment.status]}>{payment.status}</Badge>
                    {payment.note ? <p className="mt-1 text-xs text-muted">{payment.note}</p> : null}
                  </>
                )}
              </td>
            </tr>
          ))}
          {items.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted">
                No payments.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </Card>
  );
}
