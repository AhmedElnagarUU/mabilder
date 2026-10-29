import { checkCronSecret } from "@/features/notifications/cron-secret";
import { dispatchQueuedEmails } from "@/features/notifications/dispatch";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const check = checkCronSecret(request.headers.get("x-cron-secret"));

  if (check === "unconfigured") {
    return Response.json(
      { error: "Cron is not configured.", code: "cron_unavailable" },
      { status: 503 },
    );
  }

  if (check === "unauthorized") {
    return Response.json(
      { error: "Not allowed.", code: "unauthorized" },
      { status: 401 },
    );
  }

  try {
    return Response.json({ ok: true, processed: await dispatchQueuedEmails() });
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to send the queued emails.", code: "dispatch_failed" },
      { status: 500 },
    );
  }
}
