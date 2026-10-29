import { z } from "zod";
import type { ActivityItem } from "../activity/types";
import type { PaymentItem } from "../billing/payments/types";
import type { AccessState } from "../billing/types";
import type { SiteStatus, SiteSummary } from "../site-creation/types";

export const USERS_PAGE_SIZE = 25;

// Lenient on purpose: a bad filter in the URL falls back to the default instead of failing the page.
export const userListQuerySchema = z.object({
  search: z.string().trim().max(100).optional().catch(undefined),
  status: z.enum(["active", "inactive"]).optional().catch(undefined),
  sort: z.enum(["lastActive", "joined"]).catch("lastActive"),
  page: z.coerce.number().int().min(1).catch(1),
});

export type UserListQuery = z.output<typeof userListQuerySchema>;

export const ADMIN_ACTOR_ID = "admin";

export type OverviewStats = {
  totalUsers: number;
  activeToday: number;
  active7Days: number;
  active30Days: number;
  newSignUps7Days: number;
  inactiveUsers: number;
  sitesReady: number;
  sitesError: number;
  pendingPayments: number;
  trialUsers: number;
  proUsers: number;
  expiredUsers: number;
};

export type UserListItem = {
  id: string;
  name: string;
  email: string;
  inactive: boolean;
  siteStatus: SiteStatus | null;
  lastActiveAt: string | null;
  createdAt: string | null;
};

export type UserListPage = {
  items: UserListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  inactive: boolean;
  locale: string | null;
  lastActiveAt: string | null;
  createdAt: string | null;
};

export type UserPlan = {
  state: AccessState;
  until: string | null;
};

export type UserDetail = {
  user: UserProfile;
  plan: UserPlan;
  site: SiteSummary | null;
  activity: ActivityItem[];
};

export type AdminPaymentRow = PaymentItem & {
  userName: string;
  userEmail: string;
};

export type AdminPaymentList = {
  items: AdminPaymentRow[];
  expectedPriceEgp: number | null;
};

export type AccountChangeResult = "ok" | "not_found";
