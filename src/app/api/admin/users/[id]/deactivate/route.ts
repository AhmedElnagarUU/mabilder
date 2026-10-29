import { requireAdminApi } from "@/features/admin/auth/guards";
import { deactivateUser } from "@/features/admin/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/users/[id]/deactivate">,
) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  try {
    const { id } = await context.params;

    if ((await deactivateUser(id)) === "not_found") {
      return Response.json(
        { error: "User not found.", code: "user_not_found" },
        { status: 404 },
      );
    }

    return Response.json({ ok: true });
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to deactivate the account.", code: "deactivate_failed" },
      { status: 500 },
    );
  }
}
