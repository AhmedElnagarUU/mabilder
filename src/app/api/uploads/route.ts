import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { subscriptionRequiredResponse } from "@/features/billing/require-access";
import { requestUpload } from "@/features/uploads/service";
import { uploadRequestSchema } from "@/features/uploads/types";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

function invalidRequestResponse(): Response {
  return Response.json({ error: "Invalid request.", code: "invalid_request" }, { status: 400 });
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const parsed = uploadRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return invalidRequestResponse();
    }

    const result = await requestUpload(user.id, parsed.data);

    if (result.ok) {
      return Response.json({ uploadUrl: result.uploadUrl, publicUrl: result.publicUrl });
    }

    if (result.code === "site_not_found") {
      return Response.json({ error: "Site not found.", code: "site_not_found" }, { status: 404 });
    }

    return Response.json(
      { error: "Uploads are not available.", code: "uploads_unavailable" },
      { status: 503 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return invalidRequestResponse();
    }

    const expired = subscriptionRequiredResponse(error);

    if (expired) {
      return expired;
    }

    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error("Failed to prepare an upload.");
    return Response.json(
      { error: "Failed to prepare the upload.", code: "upload_failed" },
      { status: 500 },
    );
  }
}
