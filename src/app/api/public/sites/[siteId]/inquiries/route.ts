import { readSubmissionBody, visitorIp } from "@/features/inquiries/request";
import {
  corsHeaders,
  inquiryErrorResponse,
  submitResultResponse,
} from "@/features/inquiries/responses";
import { submitInquiry } from "@/features/inquiries/service";

export const dynamic = "force-dynamic";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function POST(
  request: Request,
  context: RouteContext<"/api/public/sites/[siteId]/inquiries">,
) {
  try {
    const { siteId } = await context.params;
    const { body, fromForm } = await readSubmissionBody(request);
    const result = await submitInquiry(siteId, body, visitorIp(request.headers));

    return submitResultResponse(result, fromForm, request.headers.get("referer"));
  } catch (error) {
    return inquiryErrorResponse(error, corsHeaders);
  }
}
