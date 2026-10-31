export type SubmissionBody = { body: unknown; fromForm: boolean };

// A quote is a few short fields; anything bigger is not a real visitor request.
const MAX_BODY_BYTES = 16_000;

// JSON from site.js, or a normal form post (no JavaScript). A bad body throws SyntaxError (400).
export async function readSubmissionBody(request: Request): Promise<SubmissionBody> {
  const type = request.headers.get("content-type") ?? "";

  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) {
    throw new SyntaxError("Body too large.");
  }

  if (type.includes("application/json")) {
    return { body: await request.json(), fromForm: false };
  }

  if (!type.includes("application/x-www-form-urlencoded") && !type.includes("multipart/form-data")) {
    throw new SyntaxError("Unsupported content type.");
  }

  const form = await request.formData();
  const fields = [...form.entries()].filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  );

  return { body: Object.fromEntries(fields), fromForm: true };
}

export function visitorIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip") || "unknown";
}
