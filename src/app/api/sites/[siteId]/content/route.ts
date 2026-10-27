import { saveContent } from "@/features/site-creation/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  context: RouteContext<"/api/sites/[siteId]/content">,
) {
  try {
    const { siteId } = await context.params;
    const result = await saveContent(siteId, await request.json());

    if (!result) {
      return Response.json({ error: "Site not found." }, { status: 404 });
    }

    if (!result.ok) {
      return Response.json({ errors: result.errors }, { status: 400 });
    }

    return Response.json({ ok: true, site: result.site });
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to save and regenerate the site." },
      { status: 500 },
    );
  }
}
