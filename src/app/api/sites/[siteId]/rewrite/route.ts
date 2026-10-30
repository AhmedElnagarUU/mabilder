import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { subscriptionRequiredResponse } from "@/features/billing/require-access";
import { rewriteContent } from "@/features/site-creation/rewrite";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(
  request: Request,
  context: RouteContext<"/api/sites/[siteId]/rewrite">,
) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const { siteId } = await context.params;
    const body: unknown = await request.json().catch(() => null);
    const result = await rewriteContent(user.id, siteId, body);

    if (!result) {
      return Response.json(
        { error: "Site not found.", code: "site_not_found" },
        { status: 404 },
      );
    }

    if (result.ok) {
      return Response.json(result);
    }

    if (result.code === "credits_exhausted") {
      return Response.json(
        {
          error: "You have used all your AI credits for now.",
          code: result.code,
          nextResetAt: result.nextResetAt,
        },
        { status: 429 },
      );
    }

    return Response.json(
      { error: "Choose at least one text section to rewrite.", code: result.code },
      { status: 400 },
    );
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
        error: "The rewrite failed. Nothing was changed and no credit was used.",
        code: "rewrite_failed",
      },
      { status: 500 },
    );
  }
}
