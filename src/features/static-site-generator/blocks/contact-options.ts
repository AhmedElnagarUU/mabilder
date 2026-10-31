import type { Locale } from "../locale";

export const budgetKeys = ["small", "medium", "large", "unsure"] as const;
export const startKeys = ["month", "quarter", "later"] as const;

export type BudgetKey = (typeof budgetKeys)[number];
export type StartKey = (typeof startKeys)[number];

type FormLabels = {
  phonePlaceholder: string;
  serviceLabel: string;
  locationPlaceholder: string;
  budgetLabel: string;
  startLabel: string;
  privacyNote: string;
  errorMessage: string;
  sendingLabel: string;
  budgetOptions: Record<BudgetKey, string>;
  startOptions: Record<StartKey, string>;
};

export const contactFormLabels: Record<Locale, FormLabels> = {
  en: {
    phonePlaceholder: "Phone number",
    serviceLabel: "Service",
    locationPlaceholder: "Project location",
    budgetLabel: "Budget",
    startLabel: "When do you want to start?",
    privacyNote: "We only use your details to reply to you.",
    errorMessage: "Something went wrong. Please check your details and try again.",
    sendingLabel: "Sending…",
    budgetOptions: {
      small: "Small project",
      medium: "Medium project",
      large: "Large project",
      unsure: "Not sure yet",
    },
    startOptions: { month: "Within a month", quarter: "In 1–3 months", later: "Later" },
  },
  ar: {
    phonePlaceholder: "رقم الهاتف",
    serviceLabel: "الخدمة",
    locationPlaceholder: "موقع المشروع",
    budgetLabel: "الميزانية",
    startLabel: "متى تريد البدء؟",
    privacyNote: "نستخدم بياناتك فقط للرد عليك.",
    errorMessage: "حدث خطأ ما. يرجى التحقق من بياناتك والمحاولة مرة أخرى.",
    sendingLabel: "جارٍ الإرسال…",
    budgetOptions: {
      small: "مشروع صغير",
      medium: "مشروع متوسط",
      large: "مشروع كبير",
      unsure: "لست متأكدًا بعد",
    },
    startOptions: { month: "خلال شهر", quarter: "خلال 1–3 أشهر", later: "لاحقًا" },
  },
};

type OptionalLabelKey =
  | "phonePlaceholder"
  | "serviceLabel"
  | "locationPlaceholder"
  | "budgetLabel"
  | "startLabel"
  | "privacyNote"
  | "errorMessage";

// Labels the owner or the AI wrote win; older sites without them get the fixed set.
export function resolveFormLabels(
  form: Partial<Record<OptionalLabelKey, string>>,
  locale: Locale,
): FormLabels {
  const fixed = contactFormLabels[locale];

  return {
    ...fixed,
    phonePlaceholder: form.phonePlaceholder ?? fixed.phonePlaceholder,
    serviceLabel: form.serviceLabel ?? fixed.serviceLabel,
    locationPlaceholder: form.locationPlaceholder ?? fixed.locationPlaceholder,
    budgetLabel: form.budgetLabel ?? fixed.budgetLabel,
    startLabel: form.startLabel ?? fixed.startLabel,
    privacyNote: form.privacyNote ?? fixed.privacyNote,
    errorMessage: form.errorMessage ?? fixed.errorMessage,
  };
}
