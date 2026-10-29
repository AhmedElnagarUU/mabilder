import type { Locale } from "../../static-site-generator/locale";
import type { PageSlug } from "../../static-site-generator/site-content";

export type SiteLabels = {
  pages: Record<PageSlug, string>;
  navCta: string;
  menu: string;
  language: string;
  photoCredits: string;
  rights: string;
  yearsInBusiness: string;
  projectCount: string;
  clients: string;
  awards: string;
  allProjects: string;
  founded: string;
  today: string;
  foundedBody: (businessName: string) => string;
  todayBody: (years: number) => string;
};

export const siteLabels: Record<Locale, SiteLabels> = {
  en: {
    pages: {
      index: "Home",
      about: "About",
      services: "Services",
      projects: "Projects",
      contact: "Contact",
    },
    navCta: "Get in touch",
    menu: "Menu",
    language: "العربية",
    photoCredits: "Photo credits",
    rights: "All rights reserved.",
    yearsInBusiness: "Years in business",
    projectCount: "Projects completed",
    clients: "Clients",
    awards: "Awards",
    allProjects: "View all projects",
    founded: "Founded",
    today: "Today",
    foundedBody: (businessName) => `${businessName} opens its doors.`,
    todayBody: (years) => `${years} years in business.`,
  },
  ar: {
    pages: {
      index: "الرئيسية",
      about: "من نحن",
      services: "خدماتنا",
      projects: "مشاريعنا",
      contact: "تواصل معنا",
    },
    navCta: "تواصل معنا",
    menu: "القائمة",
    language: "English",
    photoCredits: "حقوق الصور",
    rights: "جميع الحقوق محفوظة.",
    yearsInBusiness: "سنوات الخبرة",
    projectCount: "المشاريع المنجزة",
    clients: "العملاء",
    awards: "الجوائز",
    allProjects: "عرض كل المشاريع",
    founded: "التأسيس",
    today: "اليوم",
    foundedBody: (businessName) => `تأسيس ${businessName}.`,
    todayBody: (years) => `سنوات الخبرة: ${years}.`,
  },
};
