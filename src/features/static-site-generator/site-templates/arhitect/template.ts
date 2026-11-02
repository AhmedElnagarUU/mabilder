import type { SiteTemplate } from "../types";

// Archivo (800, uppercase) and IBM Plex Sans for Latin; Cairo (display) and IBM Plex Sans Arabic
// (body) for Arabic. The red bands, muted text and hairlines in arhitect.css are mixed from these
// three colors.
const fontUrl =
  "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Sans:wght@300;400;500;600&family=Cairo:wght@400;600;800&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600&display=swap";

export const arhitectTemplate: SiteTemplate = {
  id: "arhitect",
  name: "Arhitect",
  mood: {
    en: "Black cinematic tech: pure black, wide uppercase type and a signal-red accent",
    ar: "أسلوب تقني سينمائي داكن: أسود نقي، خطوط عريضة بأحرف كبيرة، وأحمر إشارة",
  },
  tokens: {
    bg: "#0a0a0a",
    ink: "#ededed",
    accent: "#e5322d",
    fontDisplay: '"Archivo", "Cairo", sans-serif',
    fontBody: '"IBM Plex Sans", "IBM Plex Sans Arabic", sans-serif',
    radius: "0px",
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
    testimonials: "arhitect/testimonials-invert",
    marquee: "arhitect/marquee-default",
    values: "arhitect/values-columns",
    clients: "arhitect/clients-default",
    awards: "arhitect/awards-rows",
    timeline: "arhitect/timeline-rows",
    team: "arhitect/team-grid",
    location: "arhitect/location-box",
  },
};
