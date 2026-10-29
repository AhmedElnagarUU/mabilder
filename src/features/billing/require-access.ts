import { getUserAccess } from "./user-access";

export class SubscriptionRequiredError extends Error {
  constructor() {
    super("An active trial or subscription is required.");
  }
}

export async function requireAccess(userId: string): Promise<void> {
  if ((await getUserAccess(userId)).state === "expired") {
    throw new SubscriptionRequiredError();
  }
}

export function subscriptionRequiredResponse(error: unknown): Response | null {
  if (!(error instanceof SubscriptionRequiredError)) {
    return null;
  }

  return Response.json(
    {
      error: "Your free trial has ended. Subscribe to continue.",
      code: "subscription_required",
    },
    { status: 402 },
  );
}
