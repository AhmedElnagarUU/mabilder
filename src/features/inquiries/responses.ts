import { databaseErrorResponse } from "../../shared/db/errors";
import { subscriptionRequiredResponse } from "../billing/require-access";
import type { OwnerResult, SubmitResult } from "./service";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const failureStatus = {
  site_not_found: 404,
  inquiry_not_found: 404,
  invalid_request: 400,
  rate_limited: 429,
} as const;

const failureMessage = {
  site_not_found: "Site not found.",
  inquiry_not_found: "Request not found.",
  invalid_request: "Invalid request.",
  rate_limited: "Too many requests. Please try again later.",
} as const;

type Failure = Exclude<SubmitResult | OwnerResult<unknown>, { ok: true }>;

function failureResponse(result: Failure, headers: HeadersInit): Response {
  const errors = result.code === "invalid_request" ? { errors: result.errors } : {};

  return Response.json(
    { error: failureMessage[result.code], code: result.code, ...errors },
    { status: failureStatus[result.code], headers },
  );
}

export function ownerResultResponse<Value>(
  result: OwnerResult<Value>,
  toBody: (value: Value) => object,
): Response {
  return result.ok ? Response.json(toBody(result.value)) : failureResponse(result, {});
}

// A form posted without JavaScript goes back to the page it came from with ?sent=1.
function redirectBack(referer: string | null): Response | null {
  if (!referer || !/^https?:\/\//.test(referer)) {
    return null;
  }

  const target = new URL(referer);
  target.searchParams.set("sent", "1");

  return new Response(null, { status: 303, headers: { ...corsHeaders, Location: target.toString() } });
}

export function submitResultResponse(
  result: SubmitResult,
  fromForm: boolean,
  referer: string | null,
): Response {
  if (!result.ok) {
    return failureResponse(result, corsHeaders);
  }

  return (fromForm ? redirectBack(referer) : null) ?? Response.json({ ok: true }, { headers: corsHeaders });
}

export function inquiryErrorResponse(error: unknown, headers: HeadersInit = {}): Response {
  if (error instanceof SyntaxError) {
    return Response.json({ error: "Invalid request.", code: "invalid_request" }, { status: 400, headers });
  }

  const required = subscriptionRequiredResponse(error);

  if (required) {
    return required;
  }

  const unavailable = databaseErrorResponse(error);

  if (unavailable) {
    return unavailable;
  }

  console.error(error);
  return Response.json({ error: "Failed to handle the request.", code: "save_failed" }, { status: 500, headers });
}
