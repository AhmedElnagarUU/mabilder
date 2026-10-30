export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function renderText(value: string): string {
  return escapeHtml(value)
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");
}

export function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

export const renderAttribute = escapeAttribute;

const internalPagePattern =
  /^(index|about|services|our-work|profile|contact|projects)\.html(#[\w-]+)?$/;
const projectPagePattern = /^projects\/[a-z0-9-]+\.html$/;

export function isSafeHref(value: string): boolean {
  if (internalPagePattern.test(value) || projectPagePattern.test(value)) {
    return true;
  }

  return (
    value.startsWith("#") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:") ||
    value.startsWith("http://") ||
    value.startsWith("https://")
  );
}

export function isSafeImageUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}
