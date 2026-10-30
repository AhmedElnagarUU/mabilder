import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { getBalance } from "@/features/credits/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    return Response.json(await getBalance(user.id));
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Could not read your credits.", code: "credits_failed" },
      { status: 500 },
    );
  }
}
