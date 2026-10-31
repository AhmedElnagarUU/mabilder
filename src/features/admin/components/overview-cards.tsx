import { Card } from "@/shared/ui/card";
import type { OverviewStats } from "../types";

const cards: { label: string; value: (stats: OverviewStats) => number }[] = [
  { label: "Total users", value: (stats) => stats.totalUsers },
  { label: "Active today (24 h)", value: (stats) => stats.activeToday },
  { label: "Active in 7 days", value: (stats) => stats.active7Days },
  { label: "Active in 30 days", value: (stats) => stats.active30Days },
  { label: "New sign-ups (7 days)", value: (stats) => stats.newSignUps7Days },
  { label: "Deactivated users", value: (stats) => stats.inactiveUsers },
  { label: "Websites ready", value: (stats) => stats.sitesReady },
  { label: "Websites with errors", value: (stats) => stats.sitesError },
  { label: "New feedback", value: (stats) => stats.newFeedback },
  { label: "Pending payments", value: (stats) => stats.pendingPayments },
  { label: "In free trial", value: (stats) => stats.trialUsers },
  { label: "On Pro", value: (stats) => stats.proUsers },
  { label: "Plan expired", value: (stats) => stats.expiredUsers },
  { label: "Website requests (total)", value: (stats) => stats.inquiries.total },
  { label: "Website requests (24 h)", value: (stats) => stats.inquiries.today },
  { label: "Website requests (7 days)", value: (stats) => stats.inquiries.last7Days },
  { label: "Website requests (30 days)", value: (stats) => stats.inquiries.last30Days },
  { label: "Valid requests", value: (stats) => stats.inquiries.valid },
  { label: "Spam requests", value: (stats) => stats.inquiries.spam },
];

function InquiryBreakdown({ stats }: { stats: OverviewStats["inquiries"] }) {
  const reasons = Object.entries(stats.spamReasons);

  return (
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Card className="p-5">
        <p className="mono-label text-[11px] tracking-[0.13em] text-dim">Top websites by requests</p>
        {stats.topSites.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No requests yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line-soft text-sm">
            {stats.topSites.map((site) => (
              <li key={site.userId} className="flex justify-between gap-4 py-2">
                <span className="truncate">{site.businessName}</span>
                <span className="text-muted">{site.count}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card className="p-5">
        <p className="mono-label text-[11px] tracking-[0.13em] text-dim">Spam by reason</p>
        {reasons.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No spam yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line-soft text-sm">
            {reasons.map(([reason, count]) => (
              <li key={reason} className="flex justify-between gap-4 py-2">
                <span>{reason}</span>
                <span className="text-muted">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

export function OverviewCards({ stats }: { stats: OverviewStats }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.label} className="p-5">
            <p className="mono-label text-[11px] tracking-[0.13em] text-dim">{card.label}</p>
            <p className="mt-2 font-display text-3xl font-normal tracking-[-0.03em]">{card.value(stats)}</p>
          </Card>
        ))}
      </div>
      <InquiryBreakdown stats={stats.inquiries} />
    </>
  );
}
