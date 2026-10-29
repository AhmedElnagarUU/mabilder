import { requireAdminApi } from "@/features/admin/auth/guards";
import { adminErrorResponse, planResultResponse } from "@/features/admin/responses";
import { changePlan } from "@/features/admin/service";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: RouteContext<"/api/admin/users/[id]/plan">) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  try {
    const { id } = await context.params;
    const body: unknown = await request.json().catch(() => null);

    return planResultResponse(await changePlan(id, body));
  } catch (error) {
    return adminErrorResponse(error, "Failed to change the plan.", "plan_change_failed");
  }
}
