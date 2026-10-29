import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { billingErrorResponse } from "@/features/billing/errors";
import { createPortalSession } from "@/features/billing/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const body: unknown = await request.json().catch(() => ({}));
    const url = await createPortalSession(user.id, body);

    if (!url) {
      return Response.json(
        { error: "No subscription to manage.", code: "no_subscription" },
        { status: 404 },
      );
    }

    return Response.json({ url });
  } catch (error) {
    return billingErrorResponse(error, "Failed to open the billing portal.", "portal_failed");
  }
}
