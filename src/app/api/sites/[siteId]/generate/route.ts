import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { subscriptionRequiredResponse } from "@/features/billing/require-access";
import { generateContent } from "@/features/site-creation/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(
  request: Request,
  context: RouteContext<"/api/sites/[siteId]/generate">,
) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const { siteId } = await context.params;
    const site = await generateContent(user.id, siteId);

    if (!site) {
      return Response.json(
        { error: "Site not found.", code: "site_not_found" },
        { status: 404 },
      );
    }

    return Response.json({ ok: true, site });
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
      {
        error:
          "AI generation failed. Your draft is saved and you can retry from the editor.",
        code: "generation_failed",
      },
      { status: 500 },
    );
  }
}
