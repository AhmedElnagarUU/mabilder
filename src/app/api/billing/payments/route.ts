import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { billingErrorResponse } from "@/features/billing/errors";
import { listOwnPayments, submitPayment } from "@/features/billing/payments/service";
import { submitFailureResponse } from "@/features/billing/payments/responses";
import { getWalletInfo } from "@/features/billing/settings/service";
import { billingLocaleSchema } from "@/features/billing/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const { locale } = billingLocaleSchema.parse({
      locale: new URL(request.url).searchParams.get("locale") ?? undefined,
    });
    const [payments, wallet] = await Promise.all([listOwnPayments(user.id), getWalletInfo(locale)]);

    return Response.json({ payments, wallet });
  } catch (error) {
    return billingErrorResponse(error, "Failed to load the payments.", "payments_failed");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const body: unknown = await request.json().catch(() => null);
    const result = await submitPayment(user, body);

    if (!result.ok) {
      return submitFailureResponse(result.code);
    }

    return Response.json({ payment: result.payment }, { status: 201 });
  } catch (error) {
    return billingErrorResponse(error, "Failed to send the payment.", "payment_failed");
  }
}
