import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { deleteSite, getSite } from "@/features/site-creation/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext<"/api/sites/[siteId]">,
) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const { siteId } = await context.params;
    const site = await getSite(user.id, siteId);

    if (!site) {
      return Response.json(
        { error: "Site not found.", code: "site_not_found" },
        { status: 404 },
      );
    }

    return Response.json({ site });
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to load the site.", code: "load_failed" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/sites/[siteId]">,
) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const { siteId } = await context.params;
    const removed = await deleteSite(user.id, siteId);

    if (!removed) {
      return Response.json(
        { error: "Site not found.", code: "site_not_found" },
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
      { error: "Failed to delete the site.", code: "delete_failed" },
      { status: 500 },
    );
  }
}
