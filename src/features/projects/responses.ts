import { databaseErrorResponse } from "../../shared/db/errors";
import type { ProjectResult } from "./service";

const failureStatus = {
  site_not_found: 404,
  project_not_found: 404,
  invalid_request: 400,
} as const;

const failureMessage = {
  site_not_found: "Site not found.",
  project_not_found: "Project not found.",
  invalid_request: "Invalid request.",
} as const;

export function projectResultResponse<Value>(
  result: ProjectResult<Value>,
  toBody: (value: Value) => object,
  successStatus = 200,
): Response {
  if (result.ok) {
    return Response.json(toBody(result.value), { status: successStatus });
  }

  const errors = result.code === "invalid_request" ? { errors: result.errors } : {};

  return Response.json(
    { error: failureMessage[result.code], code: result.code, ...errors },
    { status: failureStatus[result.code] },
  );
}

export function projectErrorResponse(error: unknown): Response {
  if (error instanceof SyntaxError) {
    return Response.json(
      { error: "Invalid request.", code: "invalid_request" },
      { status: 400 },
    );
  }

  const unavailable = databaseErrorResponse(error);

  if (unavailable) {
    return unavailable;
  }

  console.error(error);
  return Response.json(
    { error: "Failed to save the project.", code: "save_failed" },
    { status: 500 },
  );
}
