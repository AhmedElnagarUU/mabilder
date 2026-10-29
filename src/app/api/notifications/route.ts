import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { listNotifications } from "@/features/notifications/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    return Response.json(await listNotifications(user.id));
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to load the notifications.", code: "load_failed" },
      { status: 500 },
    );
  }
}
