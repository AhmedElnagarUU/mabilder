import type { SiteTemplate } from "../types";

// Inter for Latin; Cairo for Arabic. The near-white ink, the sand accent and the hairlines in
// arhitect.css are mixed from these three colors.
const fontUrl =
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cairo:wght@400;600;700&display=swap";

export const arhitectTemplate: SiteTemplate = {
  id: "arhitect",
  name: "Arhitect",
  mood: {
    en: "Black tech: near-black pages, light uppercase type and a sand accent",
    ar: "أسلوب تقني داكن: صفحات سوداء عملياً، خطوط فاتحة بأحرف كبيرة، ولون رملي",
  },
  tokens: {
    bg: "#0a0a0a",
    ink: "#f5f5f5",
    accent: "#C4B5A0",
    fontDisplay: '"Inter", "Cairo", sans-serif',
    fontBody: '"Inter", "Cairo", sans-serif',
    radius: "0.25rem",
    space: "1rem",
    fontStylesheets: [fontUrl],
  },
  shell: "arhitect",
  designs: {
    hero: "arhitect/hero-full",
    intro: "arhitect/intro-invert",
    "feature-split": "arhitect/feature-split-default",
    services: "arhitect/services-panels",
    process: "arhitect/process-rows",
    cta: "arhitect/cta-band",
    contact: "arhitect/contact-split",
    stats: "arhitect/stats-divided",
    faq: "arhitect/faq-default",
    projects: "arhitect/projects-grid",
    testimonials: "arhitect/testimonials-list",
    marquee: "arhitect/marquee-default",
    values: "arhitect/values-columns",
    clients: "arhitect/clients-default",
    awards: "arhitect/awards-rows",
    timeline: "arhitect/timeline-rows",
    team: "arhitect/team-grid",
    location: "arhitect/location-box",
  },
};
