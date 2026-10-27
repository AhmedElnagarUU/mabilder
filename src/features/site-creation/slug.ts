import { randomUUID } from "node:crypto";

export function createSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return `${base || "site"}-${randomUUID().slice(0, 6)}`;
}
