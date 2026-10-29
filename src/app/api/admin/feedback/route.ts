import { requireAdminApi } from "@/features/admin/auth/guards";
import { listFeedbackInbox } from "@/features/admin/service";
import { feedbackListQuerySchema } from "@/features/feedback/types";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  try {
    const query = feedbackListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return Response.json(await listFeedbackInbox(query));
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to load the feedback.", code: "load_failed" },
      { status: 500 },
    );
  }
}
