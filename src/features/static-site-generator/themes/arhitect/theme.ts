import type { Theme } from "../types";
import { renderDocument } from "./document";
import { renderFooter } from "./footer";
import { renderNav } from "./nav";
import { renderProject } from "./project-page";

// Tone "dark" is the pure black base, tone "light" the slightly lifted band; pages alternate them.
export const arhitectTheme: Theme = {
  id: "arhitect",
  name: "Arhitect",
  assets: ["arhitect.css", "arhitect.js"],
  tones: ["dark", "light"],
  renderDocument,
  renderNav,
  renderFooter,
  renderProject,
};
