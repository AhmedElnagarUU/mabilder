import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { billingErrorResponse } from "@/features/billing/errors";
import { createCheckout } from "@/features/billing/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const body: unknown = await request.json().catch(() => ({}));

    return Response.json({ url: await createCheckout(user, body) });
  } catch (error) {
    return billingErrorResponse(error, "Failed to start the checkout.", "checkout_failed");
  }
}
