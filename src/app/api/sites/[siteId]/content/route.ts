import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { saveContent } from "@/features/site-creation/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  context: RouteContext<"/api/sites/[siteId]/content">,
) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const { siteId } = await context.params;
    const result = await saveContent(user.id, siteId, await request.json());

    if (!result) {
      return Response.json(
        { error: "Site not found.", code: "site_not_found" },
        { status: 404 },
      );
    }

    if (!result.ok) {
      return Response.json(
        { error: "Invalid request.", code: "invalid_request", errors: result.errors },
        { status: 400 },
      );
    }

    return Response.json({ ok: true, site: result.site });
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to save and regenerate the site.", code: "save_failed" },
      { status: 500 },
    );
  }
}
