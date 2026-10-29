import { requireAdminApi } from "@/features/admin/auth/guards";
import { listUsers } from "@/features/admin/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  try {
    const query = Object.fromEntries(new URL(request.url).searchParams);
    return Response.json(await listUsers(query));
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to load the users.", code: "load_failed" },
      { status: 500 },
    );
  }
}
