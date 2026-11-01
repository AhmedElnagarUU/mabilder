import type { BlockType } from "../blocks/catalog";

// The seven --site-* variables every design styles itself with, plus the font stylesheets they need.
export type TemplateTokens = {
  bg: string;
  ink: string;
  accent: string;
  fontDisplay: string;
  fontBody: string;
  radius: string;
  space: string;
  fontStylesheets: readonly string[];
};

export type SiteTemplate = {
  id: string;
  name: string;
  mood: { en: string; ar: string };
  tokens: TemplateTokens;
  // Theme id: document, nav, footer and project page.
  shell: string;
  // Default design id per section type; a missing type uses the base template's design.
  designs: Partial<Record<BlockType, string>>;
  // Public path of the gallery cover image (added with the gallery).
  cover?: string;
};
