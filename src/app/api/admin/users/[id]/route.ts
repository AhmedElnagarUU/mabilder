import { requireAdminApi } from "@/features/admin/auth/guards";
import { getUserDetail } from "@/features/admin/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext<"/api/admin/users/[id]">,
) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  try {
    const { id } = await context.params;
    const detail = await getUserDetail(id);

    if (!detail) {
      return Response.json(
        { error: "User not found.", code: "user_not_found" },
        { status: 404 },
      );
    }

    return Response.json(detail);
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to load the user.", code: "load_failed" },
      { status: 500 },
    );
  }
}
