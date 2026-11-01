import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { inquiryErrorResponse } from "@/features/inquiries/responses";
import { getInbox } from "@/features/inquiries/service";
import { inquiryKindSchema } from "@/features/inquiries/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: RouteContext<"/api/sites/[siteId]/inquiries">,
) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const { siteId } = await context.params;
    const kind = inquiryKindSchema.safeParse(new URL(request.url).searchParams.get("kind"));
    const inbox = await getInbox(user.id, siteId, kind.success ? kind.data : undefined);

    if (!inbox) {
      return Response.json({ error: "Site not found.", code: "site_not_found" }, { status: 404 });
    }

    return Response.json(inbox);
  } catch (error) {
    return inquiryErrorResponse(error);
  }
}
