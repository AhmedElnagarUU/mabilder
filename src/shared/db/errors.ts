const UNAVAILABLE_ERROR_PATTERN =
  /ServerSelectionError|MongoNetworkError|MongoNetworkTimeoutError|ETIMEDOUT|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ENETUNREACH|EHOSTUNREACH/;

function isDatabaseUnavailable(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return UNAVAILABLE_ERROR_PATTERN.test(`${error.name} ${error.message}`);
}

export function databaseErrorResponse(error: unknown): Response | null {
  if (!isDatabaseUnavailable(error)) {
    return null;
  }

  console.error(
    "[db] unreachable:",
    error instanceof Error ? error.message : error,
  );

  return Response.json(
    {
      error:
        "The database is unreachable right now. Please try again in a moment.",
      code: "database_unavailable",
    },
    { status: 503 },
  );
}
