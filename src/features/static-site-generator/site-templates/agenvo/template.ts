import type { BlockType } from "../../blocks/catalog";
import { agenvoPack } from "../../designs/agenvo/pack";
import { getFontUrl } from "../../themes/agenvo/document";
import type { SiteTemplate } from "../types";

// The first design of each category in the pack is the pack's default.
function defaultDesigns(): Partial<Record<BlockType, string>> {
  const designs: Partial<Record<BlockType, string>> = {};

  for (const design of agenvoPack.designs) {
    if (designs[design.category] === undefined) {
      designs[design.category] = design.id;
    }
  }

  return designs;
}

// Token values are the ones in the shell's assets/site.css, so this template adds nothing to the page.
export const classicTemplate: SiteTemplate = {
  id: "agenvo",
  name: "Classic",
  mood: {
    en: "Warm, calm and timeless",
    ar: "دافئ وهادئ وخالد",
  },
  tokens: {
    bg: "#f4efe6",
    ink: "#1c1c1c",
    accent: "#b8956c",
    fontDisplay: '"Cormorant Garamond", "IBM Plex Sans Arabic", serif',
    fontBody: '"DM Sans", "IBM Plex Sans Arabic", sans-serif',
    radius: "2px",
    space: "1rem",
    fontStylesheets: [getFontUrl("en")],
  },
  shell: "agenvo",
  designs: defaultDesigns(),
};
