import { recordActivity } from "../activity/service";
import { notify } from "../notifications/service";
import { getAccess } from "./access";
import {
  getPolar,
  getProductId,
  isUnknownWebhookTypeError,
  isWebhookError,
  isWebhookSignatureError,
  verifyWebhook,
} from "./polar";
import { findSubscription, findUserCreatedAt, upsertSubscription } from "./repository";
import {
  billingLocaleSchema,
  type Access,
  type AccessState,
  type BillingLocale,
  type SubscriptionRecord,
} from "./types";

export type WebhookResult = "processed" | "ignored" | "invalid_signature" | "invalid_payload";

type PolarSubscriptionData = {
  id: string;
  status: string;
  current_period_end: string;
  customer: { external_id?: string | null };
};

const PLAN_BY_STATE = { trial: "trial", active: "pro", expired: "expired" } as const;

function billingUrl(locale: BillingLocale): string {
  const base = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  return `${base}/${locale}/billing`;
}

export async function createCheckout(
  user: { id: string; email: string },
  input: unknown,
): Promise<string> {
  const { locale } = billingLocaleSchema.parse(input ?? {});

  const checkout = await getPolar().checkouts.create({
    products: [getProductId()],
    external_customer_id: user.id,
    customer_email: user.email,
    success_url: billingUrl(locale),
  });

  return checkout.url;
}

// Null when the user never subscribed through Polar, so there is no customer to open.
export async function createPortalSession(
  userId: string,
  input: unknown,
): Promise<string | null> {
  const { locale } = billingLocaleSchema.parse(input ?? {});
  const subscription = await findSubscription(userId);

  if (subscription?.provider !== "polar") {
    return null;
  }

  const session = await getPolar().customerSessions.create({
    external_customer_id: userId,
    return_url: billingUrl(locale),
  });

  return session.customer_portal_url;
}

function toRecord(userId: string, data: PolarSubscriptionData, revoked: boolean): SubscriptionRecord {
  return {
    userId,
    provider: "polar",
    status: revoked ? "revoked" : data.status,
    currentPeriodEnd: new Date(data.current_period_end),
    externalId: data.id,
  };
}

async function recordPlanChange(userId: string, from: Access, to: Access): Promise<void> {
  if (from.state === to.state) {
    return;
  }

  const plan = PLAN_BY_STATE[to.state satisfies AccessState];

  await recordActivity({ userId, actorId: userId, type: "plan_changed", meta: { plan } });
  await notify(userId, "plan_changed", { plan });
}

async function applySubscription(
  data: PolarSubscriptionData,
  revoked: boolean,
): Promise<WebhookResult> {
  const userId = data.customer.external_id;
  const createdAt = userId ? await findUserCreatedAt(userId) : null;

  if (!userId || !createdAt) {
    console.error("Polar subscription event for an unknown customer.");
    return "ignored";
  }

  const next = toRecord(userId, data, revoked);
  const previous = await upsertSubscription(next);
  const now = new Date();

  await recordPlanChange(
    userId,
    getAccess({ createdAt }, previous, now),
    getAccess({ createdAt }, next, now),
  );

  return "processed";
}

async function parseEvent(body: string, headers: Record<string, string>) {
  try {
    return await verifyWebhook(body, headers);
  } catch (error) {
    if (isWebhookSignatureError(error)) {
      return "invalid_signature";
    }

    if (isUnknownWebhookTypeError(error)) {
      return "ignored";
    }

    if (isWebhookError(error)) {
      return "invalid_payload";
    }

    throw error;
  }
}

export async function handleWebhookEvent(
  body: string,
  headers: Record<string, string>,
): Promise<WebhookResult> {
  const event = await parseEvent(body, headers);

  if (typeof event === "string") {
    return event;
  }

  switch (event.type) {
    case "subscription.created":
    case "subscription.updated":
    case "subscription.active":
    case "subscription.canceled":
    case "subscription.uncanceled":
      return applySubscription(event.data, false);
    case "subscription.revoked":
      return applySubscription(event.data, true);
    default:
      return "ignored";
  }
}
