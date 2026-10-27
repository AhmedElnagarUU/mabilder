import { siteContentSchema, type SiteContent } from "./types";

export type ContentIssue = {
  path: string;
  message: string;
};

export type ValidationResult =
  | { ok: true; content: SiteContent }
  | { ok: false; errors: ContentIssue[] };

export function validateContent(raw: string): ValidationResult {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      ok: false,
      errors: [{ path: "content", message: `Invalid JSON: ${message}` }],
    };
  }

  const result = siteContentSchema.safeParse(parsed);

  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.map((issue) => ({
        path: issue.path.join(".") || "content",
        message: issue.message,
      })),
    };
  }

  return { ok: true, content: result.data };
}
