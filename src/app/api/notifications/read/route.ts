import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { markNotificationsRead } from "@/features/notifications/service";
import { markReadSchema } from "@/features/notifications/types";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

async function readBody(request: Request): Promise<unknown> {
  const text = await request.text();
  return text ? JSON.parse(text) : {};
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const parsed = markReadSchema.safeParse(await readBody(request));

    if (!parsed.success) {
      return Response.json(
        { error: "Invalid request.", code: "invalid_request" },
        { status: 400 },
      );
    }

    await markNotificationsRead(user.id, parsed.data.ids);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: "Invalid request.", code: "invalid_request" },
        { status: 400 },
      );
    }

    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to update the notifications.", code: "save_failed" },
      { status: 500 },
    );
  }
}
