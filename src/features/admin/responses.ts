import type { PlanChangeResult } from "../billing/manual-plan";
import type { ReviewPaymentResult } from "../billing/payments/types";
import { databaseErrorResponse } from "../../shared/db/errors";

const reviewFailures: Record<Exclude<ReviewPaymentResult, "ok" | "unchanged">, [number, string]> = {
  not_found: [404, "Payment not found."],
  conflict: [409, "This payment was already reviewed the other way."],
  invalid_request: [400, "Check the note (500 characters at most)."],
};

const planFailures: Record<Exclude<PlanChangeResult, "ok">, [number, string]> = {
  not_found: [404, "User not found."],
  invalid_request: [400, "Choose an action and a date in the future."],
  plan_active: [409, "This user has an active paid plan. Grant Pro or end the plan instead."],
};

export function adminErrorResponse(error: unknown, message: string, code: string): Response {
  const unavailable = databaseErrorResponse(error);

  if (unavailable) {
    return unavailable;
  }

  console.error(error);
  return Response.json({ error: message, code }, { status: 500 });
}

export function reviewResultResponse(result: ReviewPaymentResult): Response {
  if (result === "ok" || result === "unchanged") {
    return Response.json({ ok: true, changed: result === "ok" });
  }

  const [status, error] = reviewFailures[result];
  return Response.json({ error, code: result }, { status });
}

export function planResultResponse(result: PlanChangeResult): Response {
  if (result === "ok") {
    return Response.json({ ok: true });
  }

  const [status, error] = planFailures[result];
  return Response.json({ error, code: result }, { status });
}
