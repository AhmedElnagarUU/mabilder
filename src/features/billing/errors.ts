import { databaseErrorResponse } from "@/shared/db/errors";
import { BillingNotConfiguredError } from "./polar";

export function billingErrorResponse(error: unknown, message: string, code: string): Response {
  const unavailable = databaseErrorResponse(error);

  if (unavailable) {
    return unavailable;
  }

  if (error instanceof BillingNotConfiguredError) {
    return Response.json(
      { error: "Billing is not available right now.", code: "billing_unavailable" },
      { status: 503 },
    );
  }

  console.error(error);
  return Response.json({ error: message, code }, { status: 500 });
}
