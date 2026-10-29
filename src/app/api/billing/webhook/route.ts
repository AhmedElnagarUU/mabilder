import { billingErrorResponse } from "@/features/billing/errors";
import { handleWebhookEvent } from "@/features/billing/service";

export const dynamic = "force-dynamic";

const WEBHOOK_HEADERS = ["webhook-id", "webhook-timestamp", "webhook-signature"] as const;

function readWebhookHeaders(request: Request): Record<string, string> {
  return Object.fromEntries(
    WEBHOOK_HEADERS.map((name) => [name, request.headers.get(name) ?? ""]),
  );
}

export async function POST(request: Request) {
  try {
    const result = await handleWebhookEvent(
      await request.text(),
      readWebhookHeaders(request),
    );

    if (result === "invalid_signature") {
      return Response.json(
        { error: "Invalid webhook signature.", code: "invalid_signature" },
        { status: 403 },
      );
    }

    if (result === "invalid_payload") {
      return Response.json(
        { error: "Invalid webhook payload.", code: "invalid_request" },
        { status: 400 },
      );
    }

    return Response.json({ received: true });
  } catch (error) {
    return billingErrorResponse(error, "Failed to process the webhook.", "webhook_failed");
  }
}
