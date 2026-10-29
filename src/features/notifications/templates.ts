import { escapeAttribute, escapeHtml } from "../static-site-generator/content/html";
import type {
  NotificationLocale,
  NotificationParams,
  NotificationType,
} from "./types";

type Copy = {
  subject: string;
  body: string;
  path: string;
};

type Template<T extends NotificationType> = Record<
  NotificationLocale,
  (params: NotificationParams[T]) => Copy
>;

type Templates = { [T in NotificationType]: Template<T> };

export type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

const planNames = {
  en: { trial: "Free trial", pro: "Pro", expired: "Expired" },
  ar: { trial: "التجربة المجانية", pro: "الخطة الاحترافية", expired: "منتهية" },
};

const openLabels: Record<NotificationLocale, string> = {
  en: "Open",
  ar: "افتح",
};

const dashboardPath = "/dashboard";

const templates: Templates = {
  welcome: {
    en: ({ name }) => ({
      subject: "Welcome aboard",
      body: `Hi ${name}, your account is ready. Answer a short brief and AI writes a complete website draft for you.`,
      path: dashboardPath,
    }),
    ar: ({ name }) => ({
      subject: "أهلًا بك",
      body: `مرحبًا ${name}، حسابك جاهز. أجب عن أسئلة قصيرة وسيكتب الذكاء الاصطناعي مسودة موقع كاملة لك.`,
      path: dashboardPath,
    }),
  },
  site_ready: {
    en: ({ businessName }) => ({
      subject: "Your website draft is ready",
      body: `The draft for ${businessName} is ready. Review it and make it yours.`,
      path: dashboardPath,
    }),
    ar: ({ businessName }) => ({
      subject: "مسودة موقعك جاهزة",
      body: `مسودة موقع ${businessName} جاهزة. راجعها وعدّلها كما تشاء.`,
      path: dashboardPath,
    }),
  },
  site_failed: {
    en: ({ businessName }) => ({
      subject: "We could not write your website draft",
      body: `Writing the draft for ${businessName} failed. Nothing is lost: open your dashboard and try again.`,
      path: dashboardPath,
    }),
    ar: ({ businessName }) => ({
      subject: "تعذّرت كتابة مسودة موقعك",
      body: `تعذّرت كتابة مسودة موقع ${businessName}. لم يضع شيء: افتح لوحة التحكم وحاول مرة أخرى.`,
      path: dashboardPath,
    }),
  },
  trial_ending: {
    en: ({ daysLeft }) => ({
      subject: "Your free trial is ending soon",
      body: `You have ${daysLeft} day(s) left in your free trial. Subscribe to keep your website live.`,
      path: dashboardPath,
    }),
    ar: ({ daysLeft }) => ({
      subject: "تجربتك المجانية توشك على الانتهاء",
      body: `تبقّى ${daysLeft} يوم(أيام) على انتهاء تجربتك المجانية. اشترك ليبقى موقعك فعّالًا.`,
      path: dashboardPath,
    }),
  },
  trial_ended: {
    en: () => ({
      subject: "Your free trial has ended",
      body: "Your free trial is over. Subscribe to keep editing and publishing your website.",
      path: dashboardPath,
    }),
    ar: () => ({
      subject: "انتهت تجربتك المجانية",
      body: "انتهت تجربتك المجانية. اشترك لتواصل تعديل موقعك ونشره.",
      path: dashboardPath,
    }),
  },
  payment_received: {
    en: ({ userName, amount, currency }) => ({
      subject: "New payment to review",
      body: `${userName} sent a payment of ${amount} ${currency} for review.`,
      path: "/admin/payments",
    }),
    ar: ({ userName, amount, currency }) => ({
      subject: "دفعة جديدة للمراجعة",
      body: `أرسل ${userName} دفعة بقيمة ${amount} ${currency} للمراجعة.`,
      path: "/admin/payments",
    }),
  },
  payment_approved: {
    en: ({ paidUntil }) => ({
      subject: "Your payment was approved",
      body: `Thank you. Your Pro plan is active until ${paidUntil}.`,
      path: dashboardPath,
    }),
    ar: ({ paidUntil }) => ({
      subject: "تمت الموافقة على دفعتك",
      body: `شكرًا لك. خطتك الاحترافية فعّالة حتى ${paidUntil}.`,
      path: dashboardPath,
    }),
  },
  payment_rejected: {
    en: ({ note }) => ({
      subject: "Your payment was rejected",
      body: `We could not confirm your payment.${note ? ` Note: ${note}` : ""} Please check the details and send it again.`,
      path: dashboardPath,
    }),
    ar: ({ note }) => ({
      subject: "تم رفض دفعتك",
      body: `لم نتمكن من تأكيد دفعتك.${note ? ` ملاحظة: ${note}` : ""} يرجى مراجعة البيانات وإرسالها مرة أخرى.`,
      path: dashboardPath,
    }),
  },
  plan_changed: {
    en: ({ plan }) => ({
      subject: "Your plan was changed",
      body: `Your plan is now: ${planNames.en[plan]}.`,
      path: dashboardPath,
    }),
    ar: ({ plan }) => ({
      subject: "تم تغيير خطتك",
      body: `خطتك الآن: ${planNames.ar[plan]}.`,
      path: dashboardPath,
    }),
  },
  feedback_received: {
    en: ({ userName }) => ({
      subject: "New feedback received",
      body: `${userName} sent feedback.`,
      path: "/admin/feedback",
    }),
    ar: ({ userName }) => ({
      subject: "ملاحظات جديدة",
      body: `أرسل ${userName} ملاحظات.`,
      path: "/admin/feedback",
    }),
  },
  feedback_replied: {
    en: () => ({
      subject: "We replied to your feedback",
      body: "You have a reply to your feedback. Open your dashboard to read it.",
      path: dashboardPath,
    }),
    ar: () => ({
      subject: "ردّنا على ملاحظاتك",
      body: "وصلك ردّ على ملاحظاتك. افتح لوحة التحكم لقراءته.",
      path: dashboardPath,
    }),
  },
};

function appUrl(locale: NotificationLocale, path: string): string {
  const base = process.env.BETTER_AUTH_URL || "http://localhost:3000";
  return `${base.replace(/\/+$/, "")}/${locale}${path}`;
}

function renderHtml(locale: NotificationLocale, copy: Copy, url: string): string {
  const dir = locale === "ar" ? "rtl" : "ltr";

  return [
    `<div dir="${dir}" lang="${locale}">`,
    `<h2>${escapeHtml(copy.subject)}</h2>`,
    `<p>${escapeHtml(copy.body)}</p>`,
    `<p><a href="${escapeAttribute(url)}">${escapeHtml(openLabels[locale])}</a></p>`,
    `</div>`,
  ].join("");
}

export function renderEmail<T extends NotificationType>(
  type: T,
  locale: NotificationLocale,
  params: NotificationParams[T],
): RenderedEmail {
  const template = templates[type] as Template<T>;
  const copy = template[locale](params);
  const url = appUrl(locale, copy.path);

  return {
    subject: copy.subject,
    text: `${copy.body}\n\n${openLabels[locale]}: ${url}`,
    html: renderHtml(locale, copy, url),
  };
}
