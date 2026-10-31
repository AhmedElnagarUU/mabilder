import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { inquiryErrorResponse, ownerResultResponse } from "@/features/inquiries/responses";
import { deleteInquiry, updateInquiryState } from "@/features/inquiries/service";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/sites/[siteId]/inquiries/[inquiryId]">,
) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const { siteId, inquiryId } = await context.params;
    const result = await updateInquiryState(user.id, siteId, inquiryId, await request.json());

    return ownerResultResponse(result, (inquiry) => ({ inquiry }));
  } catch (error) {
    return inquiryErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/sites/[siteId]/inquiries/[inquiryId]">,
) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const { siteId, inquiryId } = await context.params;
    const result = await deleteInquiry(user.id, siteId, inquiryId);

    return ownerResultResponse(result, () => ({ ok: true }));
  } catch (error) {
    return inquiryErrorResponse(error);
  }
}
