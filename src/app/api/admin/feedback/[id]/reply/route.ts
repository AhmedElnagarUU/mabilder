import { replyFeedback } from "@/features/admin/service";
import { requireAdminApi } from "@/features/admin/auth/guards";
import { replyFeedbackSchema } from "@/features/feedback/types";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: RouteContext<"/api/admin/feedback/[id]/reply">,
) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  const parsed = replyFeedbackSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return Response.json({ error: "Invalid request.", code: "invalid_request" }, { status: 400 });
  }

  try {
    const { id } = await context.params;
    const result = await replyFeedback(id, parsed.data.reply);

    if (result === "not_found") {
      return Response.json(
        { error: "Feedback not found.", code: "feedback_not_found" },
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
      { error: "Failed to send the reply.", code: "save_failed" },
      { status: 500 },
    );
  }
}
