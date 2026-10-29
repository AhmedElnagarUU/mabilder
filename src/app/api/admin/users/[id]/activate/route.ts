import { requireAdminApi } from "@/features/admin/auth/guards";
import { activateUser } from "@/features/admin/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/users/[id]/activate">,
) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  try {
    const { id } = await context.params;

    if ((await activateUser(id)) === "not_found") {
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
      { error: "Failed to activate the account.", code: "activate_failed" },
      { status: 500 },
    );
  }
}
