import type { Locale } from "../locale";

export const budgetKeys = ["small", "medium", "large", "unsure"] as const;
export const startKeys = ["month", "quarter", "later"] as const;

export type BudgetKey = (typeof budgetKeys)[number];
export type StartKey = (typeof startKeys)[number];

type FormLabels = {
  quoteTabLabel: string;
  visitTabLabel: string;
  visitSubmitLabel: string;
  visitDayLabel: string;
  visitTimeLabel: string;
  visitMorningLabel: string;
  visitEveningLabel: string;
  visitNotePlaceholder: string;
  visitSuccessMessage: string;
  reviewTabLabel: string;
  reviewSubmitLabel: string;
  reviewRatingLabel: string;
  reviewCommentPlaceholder: string;
  reviewProjectLabel: string;
  reviewSuccessMessage: string;
  aboutLabel: string;
  tabsLabel: string;
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
    quoteTabLabel: "Request a quote",
    visitTabLabel: "Book a site visit",
    visitSubmitLabel: "Request a visit",
    visitDayLabel: "Preferred day",
    visitTimeLabel: "Preferred time",
    visitMorningLabel: "Morning",
    visitEveningLabel: "Evening",
    visitNotePlaceholder: "Anything we should know before the visit?",
    visitSuccessMessage: "Thank you — we received your visit request and will call you to confirm.",
    reviewTabLabel: "Leave a review",
    reviewSubmitLabel: "Send review",
    reviewRatingLabel: "Your rating",
    reviewCommentPlaceholder: "Tell us about your experience",
    reviewProjectLabel: "Project (optional)",
    reviewSuccessMessage: "Thank you — your review was received and will appear once it is approved.",
    aboutLabel: "About:",
    tabsLabel: "Choose a request type",
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
    quoteTabLabel: "اطلب عرض سعر",
    visitTabLabel: "احجز زيارة للموقع",
    visitSubmitLabel: "اطلب زيارة",
    visitDayLabel: "اليوم المفضل",
    visitTimeLabel: "الوقت المفضل",
    visitMorningLabel: "صباحًا",
    visitEveningLabel: "مساءً",
    visitNotePlaceholder: "هل هناك ما يجب أن نعرفه قبل الزيارة؟",
    visitSuccessMessage: "شكرًا لك — استلمنا طلب الزيارة وسنتصل بك للتأكيد.",
    reviewTabLabel: "اترك تقييمًا",
    reviewSubmitLabel: "أرسل التقييم",
    reviewRatingLabel: "تقييمك",
    reviewCommentPlaceholder: "حدثنا عن تجربتك",
    reviewProjectLabel: "المشروع (اختياري)",
    reviewSuccessMessage: "شكرًا لك — استلمنا تقييمك وسيظهر بعد اعتماده.",
    aboutLabel: "حول:",
    tabsLabel: "اختر نوع الطلب",
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
  | "quoteTabLabel"
  | "visitTabLabel"
  | "visitSubmitLabel"
  | "visitDayLabel"
  | "visitTimeLabel"
  | "visitMorningLabel"
  | "visitEveningLabel"
  | "visitNotePlaceholder"
  | "visitSuccessMessage"
  | "reviewTabLabel"
  | "reviewSubmitLabel"
  | "reviewRatingLabel"
  | "reviewCommentPlaceholder"
  | "reviewProjectLabel"
  | "reviewSuccessMessage"
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
    quoteTabLabel: form.quoteTabLabel ?? fixed.quoteTabLabel,
    visitTabLabel: form.visitTabLabel ?? fixed.visitTabLabel,
    visitSubmitLabel: form.visitSubmitLabel ?? fixed.visitSubmitLabel,
    visitDayLabel: form.visitDayLabel ?? fixed.visitDayLabel,
    visitTimeLabel: form.visitTimeLabel ?? fixed.visitTimeLabel,
    visitMorningLabel: form.visitMorningLabel ?? fixed.visitMorningLabel,
    visitEveningLabel: form.visitEveningLabel ?? fixed.visitEveningLabel,
    visitNotePlaceholder: form.visitNotePlaceholder ?? fixed.visitNotePlaceholder,
    visitSuccessMessage: form.visitSuccessMessage ?? fixed.visitSuccessMessage,
    reviewTabLabel: form.reviewTabLabel ?? fixed.reviewTabLabel,
    reviewSubmitLabel: form.reviewSubmitLabel ?? fixed.reviewSubmitLabel,
    reviewRatingLabel: form.reviewRatingLabel ?? fixed.reviewRatingLabel,
    reviewCommentPlaceholder: form.reviewCommentPlaceholder ?? fixed.reviewCommentPlaceholder,
    reviewProjectLabel: form.reviewProjectLabel ?? fixed.reviewProjectLabel,
    reviewSuccessMessage: form.reviewSuccessMessage ?? fixed.reviewSuccessMessage,
    phonePlaceholder: form.phonePlaceholder ?? fixed.phonePlaceholder,
    serviceLabel: form.serviceLabel ?? fixed.serviceLabel,
    locationPlaceholder: form.locationPlaceholder ?? fixed.locationPlaceholder,
    budgetLabel: form.budgetLabel ?? fixed.budgetLabel,
    startLabel: form.startLabel ?? fixed.startLabel,
    privacyNote: form.privacyNote ?? fixed.privacyNote,
    errorMessage: form.errorMessage ?? fixed.errorMessage,
  };
}
