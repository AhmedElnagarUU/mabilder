import type { Locale } from "../static-site-generator/locale";
import type { Project } from "./types";

type CategoryKey = NonNullable<Project["categoryKey"]>;
type Status = NonNullable<Project["status"]>;

// Words shown on the generated website, written in the site's language (not the app UI).
export const categoryLabels: Record<Locale, Record<Exclude<CategoryKey, "other">, string>> = {
  en: {
    residential: "Residential",
    commercial: "Commercial",
    hospitality: "Hospitality",
    retail: "Retail",
    office: "Office",
    villa: "Villa",
  },
  ar: {
    residential: "سكني",
    commercial: "تجاري",
    hospitality: "ضيافة",
    retail: "تجزئة",
    office: "مكتبي",
    villa: "فيلا",
  },
};

export const statusLabels: Record<Locale, Record<Status, string>> = {
  en: { completed: "Completed", "in-progress": "In progress", upcoming: "Upcoming" },
  ar: { completed: "مكتمل", "in-progress": "قيد التنفيذ", upcoming: "قريبًا" },
};
