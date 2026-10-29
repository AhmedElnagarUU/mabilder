import type { SubmitPaymentResult } from "./types";

type SubmitFailure = Extract<SubmitPaymentResult, { ok: false }>["code"];

const failures: Record<SubmitFailure, { status: number; error: string }> = {
  invalid_request: { status: 400, error: "Check the payment details." },
  payment_pending: { status: 409, error: "You already have a payment waiting for review." },
  payments_unavailable: { status: 503, error: "Wallet payments are not available right now." },
};

export function submitFailureResponse(code: SubmitFailure): Response {
  const { status, error } = failures[code];
  return Response.json({ error, code }, { status });
}
