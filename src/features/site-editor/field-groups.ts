import type { EditableField } from "./content-ops";

export function fieldLabelKey(field: EditableField): string {
  const segments = field.path.filter((segment) => typeof segment === "string");
  return String(segments[segments.length - 1]);
}
