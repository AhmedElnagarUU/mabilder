import { Link } from "@/shared/i18n/navigation";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { inputClass } from "@/shared/ui/field";
import { buttonClass } from "@/shared/ui/button";
import type { UserListPage, UserListQuery } from "../types";
import { formatDate, formatDateTime } from "./format";
import { selectClass } from "./select-class";

const cellClass = "px-4 py-3 text-start text-sm";

function pageHref(query: UserListQuery, page: number) {
  return {
    pathname: "/admin/users",
    query: {
      ...(query.search ? { search: query.search } : {}),
      ...(query.status ? { status: query.status } : {}),
      sort: query.sort,
      page: String(page),
    },
  };
}

export function UsersFilters({ query }: { query: UserListQuery }) {
  return (
    <Card className="mb-4 p-4">
      <form method="get" className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          name="search"
          defaultValue={query.search ?? ""}
          placeholder="Search name or email"
          aria-label="Search name or email"
          className={`${inputClass} max-w-xs`}
        />
        <select name="status" defaultValue={query.status ?? ""} aria-label="Status" className={selectClass}>
          <option value="">All accounts</option>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
        </select>
        <select name="sort" defaultValue={query.sort} aria-label="Sort by" className={selectClass}>
          <option value="lastActive">Last active</option>
          <option value="joined">Joined</option>
        </select>
        <button type="submit" className={buttonClass("secondary", "md")}>
          Apply
        </button>
      </form>
    </Card>
  );
}

export function UsersTable({ users, query }: { users: UserListPage; query: UserListQuery }) {
  return (
    <>
      <Card className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="border-b border-line font-mono text-[11px] tracking-[0.1em] text-muted uppercase">
              <th className={cellClass}>Name</th>
              <th className={cellClass}>Email</th>
              <th className={cellClass}>Status</th>
              <th className={cellClass}>Website</th>
              <th className={cellClass}>Last active</th>
              <th className={cellClass}>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.items.map((user) => (
              <tr key={user.id} className="border-b border-line-soft last:border-0">
                <td className={cellClass}>
                  <Link href={`/admin/users/${user.id}`} className="font-medium text-ink underline decoration-line underline-offset-4">
                    {user.name || "(no name)"}
                  </Link>
                </td>
                <td className={cellClass}>{user.email}</td>
                <td className={cellClass}>
                  <Badge tone={user.inactive ? "danger" : "success"}>
                    {user.inactive ? "Deactivated" : "Active"}
                  </Badge>
                </td>
                <td className={cellClass}>{user.siteStatus ?? "None"}</td>
                <td className={cellClass}>{formatDateTime(user.lastActiveAt)}</td>
                <td className={cellClass}>{formatDate(user.createdAt)}</td>
              </tr>
            ))}
            {users.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted">
                  No users match.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm text-muted">
        <span>
          {users.total} users · page {users.page} of {users.pageCount}
        </span>
        <span className="flex gap-3">
          {users.page > 1 ? (
            <Link href={pageHref(query, users.page - 1)} className={buttonClass("secondary", "sm")}>
              Previous
            </Link>
          ) : null}
          {users.page < users.pageCount ? (
            <Link href={pageHref(query, users.page + 1)} className={buttonClass("secondary", "sm")}>
              Next
            </Link>
          ) : null}
        </span>
      </div>
    </>
  );
}
