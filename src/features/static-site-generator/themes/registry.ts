import { agenvoTheme } from "./agenvo/theme";
import type { Theme } from "./types";

export const themes: Theme[] = [agenvoTheme];

export function getTheme(id: string): Theme {
  const theme = themes.find((candidate) => candidate.id === id);

  if (!theme) {
    throw new Error(`Unknown theme "${id}".`);
  }

  return theme;
}
