const errorCodes = new Set([
  "invalid_request",
  "site_not_found",
  "project_not_found",
  "database_unavailable",
  "save_failed",
  "unauthorized",
]);

// Returns null on success, otherwise the error code the UI translates.
export async function sendProjectRequest(
  path: string,
  method: "POST" | "PUT" | "DELETE",
  body?: unknown,
): Promise<string | null> {
  try {
    const response = await fetch(path, {
      method,
      headers: body === undefined ? undefined : { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.ok) {
      return null;
    }

    const result = (await response.json()) as { code?: string };
    return result.code && errorCodes.has(result.code) ? result.code : "default";
  } catch {
    return "default";
  }
}
