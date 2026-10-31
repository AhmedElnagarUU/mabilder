import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { inquiryErrorResponse } from "@/features/inquiries/responses";
import { getInbox } from "@/features/inquiries/service";

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
    const inbox = await getInbox(user.id, siteId);

    if (!inbox) {
      return Response.json({ error: "Site not found.", code: "site_not_found" }, { status: 404 });
    }

    return Response.json(inbox);
  } catch (error) {
    return inquiryErrorResponse(error);
  }
}
