import type { Theme } from "../types";
import { renderDocument } from "./document";
import { renderFooter } from "./footer";
import { renderNav } from "./nav";
import { renderProject } from "./project-page";

// Tone "light" is the paper, tone "dark" is a deeper paper tint; the page alternates them.
export const atelierTheme: Theme = {
  id: "atelier",
  name: "Atelier",
  assets: ["atelier.css", "atelier.js"],
  tones: ["light", "dark"],
  renderDocument,
  renderNav,
  renderFooter,
  renderProject,
};
