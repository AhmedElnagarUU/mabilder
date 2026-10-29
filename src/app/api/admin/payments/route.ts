import { requireAdminApi } from "@/features/admin/auth/guards";
import { listAdminPayments } from "@/features/admin/payments";
import { adminErrorResponse } from "@/features/admin/responses";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    return Response.json(await listAdminPayments(query));
  } catch (error) {
    return adminErrorResponse(error, "Failed to load the payments.", "load_failed");
  }
}
