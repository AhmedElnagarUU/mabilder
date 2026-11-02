import { agenvoTheme } from "./agenvo/theme";
import { arhitectTheme } from "./arhitect/theme";
import { aureliaTheme } from "./aurelia/theme";
import { atelierTheme } from "./atelier/theme";
import type { Theme } from "./types";

export const themes: Theme[] = [agenvoTheme, aureliaTheme, arhitectTheme, atelierTheme];

export function getTheme(id: string): Theme {
  const theme = themes.find((candidate) => candidate.id === id);

  if (!theme) {
    throw new Error(`Unknown theme "${id}".`);
  }

  return theme;
}
