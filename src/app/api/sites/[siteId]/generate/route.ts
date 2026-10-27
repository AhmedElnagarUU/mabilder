import { generateContent } from "@/features/site-creation/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(
  _request: Request,
  context: RouteContext<"/api/sites/[siteId]/generate">,
) {
  try {
    const { siteId } = await context.params;
    const site = await generateContent(siteId);

    if (!site) {
      return Response.json({ error: "Site not found." }, { status: 404 });
    }

    return Response.json({ ok: true, site });
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      {
        error:
          "AI generation failed. Your draft is saved and you can retry from the editor.",
      },
      { status: 500 },
    );
  }
}
