import type { Theme } from "../types";
import { renderAwards } from "./blocks/awards";
import { renderClients } from "./blocks/clients";
import { renderContact } from "./blocks/contact";
import { renderCta } from "./blocks/cta";
import { renderFaq } from "./blocks/faq";
import { renderFeatureSplit } from "./blocks/feature-split";
import { renderHero } from "./blocks/hero";
import { renderIntro } from "./blocks/intro";
import { renderLocation } from "./blocks/location";
import { renderMarquee } from "./blocks/marquee";
import { renderProcess } from "./blocks/process";
import { renderProjects } from "./blocks/projects";
import { renderServices } from "./blocks/services";
import { renderStats } from "./blocks/stats";
import { renderTeam } from "./blocks/team";
import { renderTestimonials } from "./blocks/testimonials";
import { renderTimeline } from "./blocks/timeline";
import { renderValues } from "./blocks/values";
import { renderDocument } from "./document";
import { renderFooter } from "./footer";
import { renderNav } from "./nav";
import { renderProject } from "./project-page";

export const agenvoTheme: Theme = {
  id: "agenvo",
  name: "Agenvo",
  assets: ["site.css", "site.js"],
  tones: ["dark", "light"],
  renderDocument,
  renderNav,
  renderFooter,
  renderProject,
  blocks: {
    hero: renderHero,
    marquee: renderMarquee,
    intro: renderIntro,
    "feature-split": renderFeatureSplit,
    services: renderServices,
    values: renderValues,
    process: renderProcess,
    faq: renderFaq,
    cta: renderCta,
    contact: renderContact,
    stats: renderStats,
    clients: renderClients,
    awards: renderAwards,
    timeline: renderTimeline,
    projects: renderProjects,
    team: renderTeam,
    testimonials: renderTestimonials,
    location: renderLocation,
  },
};
