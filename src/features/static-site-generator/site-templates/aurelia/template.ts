import type { SiteTemplate } from "../types";

// Cormorant Garamond and Inter for Latin; Noto Naskh Arabic (display) and IBM Plex Sans Arabic (body) for Arabic.
const fontUrl =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600&family=Noto+Naskh+Arabic:wght@400;500;600&family=IBM+Plex+Sans+Arabic:wght@300;400;500&display=swap";

// The dark bands, gold lines and muted text in aurelia.css are mixed from these three colors.
export const aureliaTemplate: SiteTemplate = {
  id: "aurelia",
  name: "Aurelia",
  mood: {
    en: "Dark luxury: charcoal, gold lines and quiet serif type",
    ar: "فخامة داكنة: فحمي وخطوط ذهبية وخط سيريف هادئ",
  },
  tokens: {
    bg: "#12100e",
    ink: "#f3eee4",
    accent: "#c9a962",
    fontDisplay: '"Cormorant Garamond", "Noto Naskh Arabic", serif',
    fontBody: '"Inter", "IBM Plex Sans Arabic", sans-serif',
    radius: "0px",
    space: "1rem",
    fontStylesheets: [fontUrl],
  },
  shell: "aurelia",
  designs: {
    hero: "aurelia/hero-centered",
    intro: "aurelia/intro-default",
    "feature-split": "aurelia/feature-split-default",
    services: "aurelia/services-columns",
    process: "aurelia/process-default",
    cta: "aurelia/cta-default",
    contact: "aurelia/contact-default",
    stats: "aurelia/stats-band",
    faq: "aurelia/faq-default",
    projects: "aurelia/projects-tall",
    testimonials: "aurelia/testimonials-quote",
    marquee: "aurelia/marquee-default",
    values: "aurelia/values-default",
    clients: "aurelia/clients-default",
    awards: "aurelia/awards-default",
    timeline: "aurelia/timeline-default",
    team: "aurelia/team-default",
    location: "aurelia/location-default",
  },
};
