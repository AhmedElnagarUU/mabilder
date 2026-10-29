import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { sendFeedback } from "@/features/feedback/service";
import { sendFeedbackSchema } from "@/features/feedback/types";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const parsed = sendFeedbackSchema.safeParse(await request.json().catch(() => null));

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request.", code: "invalid_request" },
        { status: 400 },
      );
    }

    await sendFeedback(user.id, parsed.data);
    return Response.json({ ok: true });
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to send the feedback.", code: "save_failed" },
      { status: 500 },
    );
  }
}
