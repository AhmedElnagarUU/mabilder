import { Badge } from "@/shared/ui/badge";
import { buttonClass } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import type { UserDetail } from "../types";
import { activityLabels, formatDate, formatDateTime } from "./format";
import { PlanChangeForm } from "./plan-change-form";
import { UserActions } from "./user-actions";

const planLabels = { trial: "Free trial", active: "Pro", expired: "Expired" };

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-muted">{label}</dt>
      <dd className="text-end text-ink">{value}</dd>
    </div>
  );
}

export function UserDetailView({ detail }: { detail: UserDetail }) {
  const { user, plan, site, activity, feedback } = detail;

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="flex flex-wrap items-center justify-between gap-3 p-5 xl:col-span-2">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{user.name || "(no name)"}</p>
          <p className="truncate text-sm text-muted">
            <bdi dir="ltr">{user.email}</bdi>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={user.inactive ? "danger" : "success"}>{user.inactive ? "Deactivated" : "Active"}</Badge>
          <Badge tone={plan.state === "expired" ? "danger" : plan.state === "active" ? "success" : "neutral"}>
            {planLabels[plan.state]}
          </Badge>
        </div>
      </Card>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Profile</h2>
          <Badge tone={user.inactive ? "danger" : "success"}>
            {user.inactive ? "Deactivated" : "Active"}
          </Badge>
        </div>
        <dl className="divide-y divide-line-soft">
          <Row label="Name" value={user.name || "(no name)"} />
          <Row label="Email" value={user.email} />
          <Row label="Language" value={user.locale ?? "Unknown"} />
          <Row label="Joined" value={formatDate(user.createdAt)} />
          <Row label="Last active" value={formatDateTime(user.lastActiveAt)} />
        </dl>
        <div className="mt-6">
          <UserActions userId={user.id} inactive={user.inactive} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Plan</h2>
        <dl className="divide-y divide-line-soft">
          <Row label="Current plan" value={planLabels[plan.state]} />
          <Row label={plan.state === "trial" ? "Trial ends" : "Paid until"} value={plan.state === "expired" ? "-" : formatDate(plan.until)} />
        </dl>
        <div className="mt-6">
          <PlanChangeForm userId={user.id} />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-lg font-semibold">Website</h2>
        {site ? (
          <>
            <dl className="divide-y divide-line-soft">
              <Row label="Business" value={site.businessName} />
              <Row label="Industry" value={site.industry} />
              <Row label="Status" value={site.status} />
              <Row label="Updated" value={formatDateTime(site.updatedAt)} />
            </dl>
            {site.status === "ready" ? (
              <a
                href={`/api/admin/users/${user.id}/preview/index.html`}
                target="_blank"
                rel="noreferrer"
                className={`${buttonClass("secondary", "md")} mt-6`}
              >
                Open preview
              </a>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-muted">This user has no website yet.</p>
        )}
      </Card>

      <Card className="p-6 xl:col-span-2">
        <h2 className="mb-4 text-lg font-semibold">Activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-muted">No activity yet.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {activity.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 py-2 text-sm">
                <span>{activityLabels[item.type]}</span>
                <span className="text-muted">{formatDateTime(item.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-6 xl:col-span-2">
        <h2 className="mb-4 text-lg font-semibold">Feedback</h2>
        {feedback.length === 0 ? (
          <p className="text-sm text-muted">No feedback yet.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {feedback.map((item) => (
              <li key={item.id} className="grid gap-1 py-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted">
                    {item.rating ? `${item.rating}/5 · ` : ""}
                    {item.status}
                  </span>
                  <span className="text-muted">{formatDateTime(item.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap">{item.message}</p>
                {item.reply ? (
                  <p className="whitespace-pre-wrap text-muted">Reply: {item.reply}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
