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

export function toFilterValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toTelHref(phone: string | undefined): string {
  if (!phone) {
    return "#enquiry";
  }

  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

export function toEmailHref(email: string | undefined): string {
  return email ? `mailto:${email}` : "#enquiry";
}

export function toWebsiteHref(website: string | undefined): string {
  if (!website) {
    return "#";
  }

  return /^https?:\/\//i.test(website) ? website : `https://${website}`;
}

export function toMapsHref(location: string | undefined): string {
  if (!location) {
    return "#enquiry";
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}
