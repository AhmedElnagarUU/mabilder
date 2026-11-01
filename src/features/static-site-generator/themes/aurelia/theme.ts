import type { Theme } from "../types";
import { renderDocument } from "./document";
import { renderFooter } from "./footer";
import { renderNav } from "./nav";
import { renderProject } from "./project-page";

// Tone "dark" is the charcoal base, tone "light" is the deeper band; the page alternates them.
export const aureliaTheme: Theme = {
  id: "aurelia",
  name: "Aurelia",
  assets: ["aurelia.css", "aurelia.js"],
  tones: ["dark", "light"],
  renderDocument,
  renderNav,
  renderFooter,
  renderProject,
};
