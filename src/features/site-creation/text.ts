export function splitLines(value: string | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function splitList(value: string | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n|,|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function toMapsHref(location: string | undefined): string {
  if (!location) {
    return "#enquiry";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}
