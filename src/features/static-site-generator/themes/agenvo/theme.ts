import type { Theme } from "../types";
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
};
