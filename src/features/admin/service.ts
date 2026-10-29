import { listRecentActivity, recordActivity } from "../activity/service";
import {
  countFeedbackWithStatus,
  listFeedback,
  listFeedbackForUser,
  replyToFeedback,
  setFeedbackStatus,
} from "../feedback/service";
import type { FeedbackListQuery, FeedbackStatus } from "../feedback/types";
import { changeUserPlan, type PlanChangeResult } from "../billing/manual-plan";
import { getPendingPaymentCount } from "../billing/payments/service";
import { countPlans } from "../billing/plan-counts";
import { getUserAccess } from "../billing/user-access";
import { listSites } from "../site-creation/service";
import {
  countMatchingUsers,
  countSitesWithStatus,
  countUsers,
  deleteUserSessions,
  findSiteStatuses,
  findUser,
  findUsers,
  setInactiveFlag,
} from "./repository";
import {
  ADMIN_ACTOR_ID,
  USERS_PAGE_SIZE,
  userListQuerySchema,
  type AccountChangeResult,
  type OverviewStats,
  type UserDetail,
  type UserListPage,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVITY_LIMIT = 50;

function activeSince(now: Date, days: number): Record<string, unknown> {
  return { lastActiveAt: { $gte: new Date(now.getTime() - days * DAY_MS) } };
}

export async function getOverview(now: Date = new Date()): Promise<OverviewStats> {
  const [
    totalUsers,
    activeToday,
    active7Days,
    active30Days,
    newSignUps7Days,
    inactiveUsers,
    sitesReady,
    sitesError,
    newFeedback,
    pendingPayments,
    plans,
  ] = await Promise.all([
    countUsers({}),
    countUsers(activeSince(now, 1)),
    countUsers(activeSince(now, 7)),
    countUsers(activeSince(now, 30)),
    countUsers({ createdAt: { $gte: new Date(now.getTime() - 7 * DAY_MS) } }),
    countUsers({ inactive: true }),
    countSitesWithStatus("ready"),
    countSitesWithStatus("error"),
    countFeedbackWithStatus("new"),
    getPendingPaymentCount(),
    countPlans(now),
  ]);

  return {
    totalUsers,
    activeToday,
    active7Days,
    active30Days,
    newSignUps7Days,
    inactiveUsers,
    sitesReady,
    sitesError,
    newFeedback,
    pendingPayments,
    trialUsers: plans.trial,
    proUsers: plans.active,
    expiredUsers: plans.expired,
  };
}

export async function listUsers(queryInput: unknown): Promise<UserListPage> {
  const query = userListQuerySchema.parse(queryInput ?? {});
  const [total, users] = await Promise.all([
    countMatchingUsers(query),
    findUsers(query, (query.page - 1) * USERS_PAGE_SIZE, USERS_PAGE_SIZE),
  ]);
  const siteStatuses = await findSiteStatuses(users.map((user) => user.id));

  return {
    items: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      inactive: user.inactive,
      siteStatus: siteStatuses.get(user.id) ?? null,
      lastActiveAt: user.lastActiveAt,
      createdAt: user.createdAt,
    })),
    total,
    page: query.page,
    pageSize: USERS_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / USERS_PAGE_SIZE)),
  };
}

export async function getUserDetail(userId: string): Promise<UserDetail | null> {
  const user = await findUser(userId);

  if (!user) {
    return null;
  }

  const [sites, activity, feedback, access] = await Promise.all([
    listSites(user.id),
    listRecentActivity(user.id, ACTIVITY_LIMIT),
    listFeedbackForUser(user.id),
    getUserAccess(user.id),
  ]);
  const until = access.trialEndsAt ?? access.renewsAt;

  return {
    user,
    plan: { state: access.state, until: until?.toISOString() ?? null },
    site: sites[0] ?? null,
    activity,
    feedback,
  };
}

export function listFeedbackInbox(query: FeedbackListQuery) {
  return listFeedback(query);
}

export function changeFeedbackStatus(id: string, status: FeedbackStatus) {
  return setFeedbackStatus(id, status);
}

export function replyFeedback(id: string, reply: string) {
  return replyToFeedback(ADMIN_ACTOR_ID, id, reply);
}

export async function deactivateUser(userId: string): Promise<AccountChangeResult> {
  if (!(await findUser(userId))) {
    return "not_found";
  }

  const changed = await setInactiveFlag(userId, true);
  await deleteUserSessions(userId);

  if (changed) {
    await recordActivity({ userId, actorId: ADMIN_ACTOR_ID, type: "account_deactivated" });
  }

  return "ok";
}

export async function activateUser(userId: string): Promise<AccountChangeResult> {
  if (!(await findUser(userId))) {
    return "not_found";
  }

  const changed = await setInactiveFlag(userId, false);

  if (changed) {
    await recordActivity({ userId, actorId: ADMIN_ACTOR_ID, type: "account_activated" });
  }

  return "ok";
}

export function changePlan(userId: string, input: unknown): Promise<PlanChangeResult> {
  return changeUserPlan(userId, ADMIN_ACTOR_ID, input);
}

// One website per account; the admin preview serves that site's files.
export async function findUserSiteId(userId: string): Promise<string | null> {
  const sites = await listSites(userId);
  return sites[0]?.id ?? null;
}
