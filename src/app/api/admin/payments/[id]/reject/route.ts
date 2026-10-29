import { requireAdminApi } from "@/features/admin/auth/guards";
import { rejectUserPayment } from "@/features/admin/payments";
import { adminErrorResponse, reviewResultResponse } from "@/features/admin/responses";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/payments/[id]/reject">,
) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  try {
    const { id } = await context.params;
    const body: unknown = await request.json().catch(() => ({}));

    return reviewResultResponse(await rejectUserPayment(id, body));
  } catch (error) {
    return adminErrorResponse(error, "Failed to reject the payment.", "reject_failed");
  }
}
