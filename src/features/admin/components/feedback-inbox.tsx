import { Link } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import type { FeedbackEntry, FeedbackListQuery, FeedbackPage, FeedbackStatus } from "../../feedback/types";
import { formatDateTime } from "./format";
import { FeedbackItemActions } from "./feedback-item-actions";

const tabs: { label: string; status?: FeedbackStatus }[] = [
  { label: "All" },
  { label: "New", status: "new" },
  { label: "Read", status: "read" },
  { label: "Resolved", status: "resolved" },
];

const statusTones: Record<FeedbackStatus, "warn" | "neutral" | "success"> = {
  new: "warn",
  read: "neutral",
  resolved: "success",
};

function inboxHref(query: { status?: FeedbackStatus; page?: number }) {
  return {
    pathname: "/admin/feedback",
    query: {
      ...(query.status ? { status: query.status } : {}),
      ...(query.page && query.page > 1 ? { page: String(query.page) } : {}),
    },
  };
}

function FeedbackTabs({ current }: { current?: FeedbackStatus }) {
  return (
    <nav aria-label="Feedback status" className="mb-6 flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <Link
          key={tab.label}
          href={inboxHref({ status: tab.status })}
          aria-current={tab.status === current ? "page" : undefined}
          className={buttonClass(tab.status === current ? "accent" : "secondary", "sm")}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

function FeedbackCard({ item }: { item: FeedbackEntry }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{item.userName || "(no name)"}</p>
          <Link href={`/admin/users/${item.userId}`} className="text-sm text-accent hover:underline">
            {item.userEmail}
          </Link>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <Badge tone={statusTones[item.status]}>{item.status}</Badge>
          {item.rating ? <span>{item.rating}/5</span> : null}
          {item.page ? <span className="font-mono text-xs">{item.page}</span> : null}
          <span>{formatDateTime(item.createdAt)}</span>
        </div>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm leading-[1.7]">{item.message}</p>

      {item.reply ? (
        <div className="mt-4 rounded-xl border border-line-soft p-3 text-sm">
          <p className="mb-1 text-muted">Reply · {formatDateTime(item.repliedAt)}</p>
          <p className="whitespace-pre-wrap">{item.reply}</p>
        </div>
      ) : null}

      <div className="mt-4">
        <FeedbackItemActions feedbackId={item.id} status={item.status} />
      </div>
    </Card>
  );
}

export function FeedbackInbox({ page, query }: { page: FeedbackPage; query: FeedbackListQuery }) {
  return (
    <>
      <FeedbackTabs current={query.status} />

      {page.items.length === 0 ? (
        <p className="text-sm text-muted">No feedback here yet.</p>
      ) : (
        <ul className="grid gap-4">
          {page.items.map((item) => (
            <li key={item.id}>
              <FeedbackCard item={item} />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>
          {page.total} items · page {page.page} of {page.pageCount}
        </span>
        <span className="flex gap-3">
          {page.page > 1 ? (
            <Link
              href={inboxHref({ status: query.status, page: page.page - 1 })}
              className={buttonClass("secondary", "sm")}
            >
              Previous
            </Link>
          ) : null}
          {page.page < page.pageCount ? (
            <Link
              href={inboxHref({ status: query.status, page: page.page + 1 })}
              className={buttonClass("secondary", "sm")}
            >
              Next
            </Link>
          ) : null}
        </span>
      </div>
    </>
  );
}
