export const DEFAULT_NEXT_PATH = "/dashboard";

// Only same-site, locale-less paths ("/dashboard"), never "//host" or full URLs.
export function safeNextPath(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.startsWith("/\\")
  ) {
    return DEFAULT_NEXT_PATH;
  }

  return value;
}
