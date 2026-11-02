import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { subscriptionRequiredResponse } from "@/features/billing/require-access";
import {
  applyTemplateBodySchema,
  applyTemplateToSite,
} from "@/features/site-editor/template-service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: RouteContext<"/api/sites/[siteId]/template">,
) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const body = applyTemplateBodySchema.safeParse(await request.json().catch(() => null));

    if (!body.success) {
      return Response.json({ error: "Unknown template.", code: "invalid_request" }, { status: 400 });
    }

    const { siteId } = await context.params;
    const result = await applyTemplateToSite(user.id, siteId, body.data.templateId);

    if (!result) {
      return Response.json({ error: "Site not found.", code: "site_not_found" }, { status: 404 });
    }

    if (!result.ok) {
      return Response.json(
        { error: "Invalid request.", code: "invalid_request", errors: result.errors },
        { status: 400 },
      );
    }

    return Response.json({ ok: true, site: result.site });
  } catch (error) {
    const expired = subscriptionRequiredResponse(error);

    if (expired) {
      return expired;
    }

    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to apply the template.", code: "save_failed" },
      { status: 500 },
    );
  }
}
