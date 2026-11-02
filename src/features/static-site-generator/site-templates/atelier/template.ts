import type { SiteTemplate } from "../types";

// Playfair Display and Manrope for Latin; Amiri (display) and Tajawal (body) for Arabic.
const fontUrl =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Manrope:wght@300;400;500;600&family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@300;400;500;700&display=swap";

// The hairlines, tinted bands and dark quote band in atelier.css are mixed from these three colors.
export const atelierTemplate: SiteTemplate = {
  id: "atelier",
  name: "Atelier",
  mood: {
    en: "Light editorial: warm paper, serif titles with an italic olive accent and thin lines",
    ar: "أسلوب مجلات خفيف: ورق دافئ وعناوين بخط سيريف مع كلمة مائلة بلون الزيتون وخطوط رفيعة",
  },
  tokens: {
    bg: "#f6f3ee",
    ink: "#1f1d1a",
    accent: "#5f6b3a",
    fontDisplay: '"Playfair Display", "Amiri", serif',
    fontBody: '"Manrope", "Tajawal", sans-serif',
    radius: "0px",
    space: "1rem",
    fontStylesheets: [fontUrl],
  },
  shell: "atelier",
  designs: {
    hero: "atelier/hero-split",
    intro: "atelier/intro-default",
    "feature-split": "atelier/feature-split-default",
    services: "atelier/services-columns",
    process: "atelier/process-default",
    cta: "atelier/cta-default",
    contact: "atelier/contact-default",
    stats: "atelier/stats-row",
    faq: "atelier/faq-default",
    projects: "atelier/projects-columns",
    testimonials: "atelier/testimonials-band",
    marquee: "atelier/marquee-default",
    values: "atelier/values-default",
    clients: "atelier/clients-default",
    awards: "atelier/awards-default",
    timeline: "atelier/timeline-default",
    team: "atelier/team-default",
    location: "atelier/location-default",
  },
};
