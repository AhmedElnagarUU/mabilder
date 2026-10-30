export type TourId = "dashboard" | "projects" | "editor" | "seo" | "tracking";

export type TourStep = {
  target: string;
  titleKey: string;
  bodyKey: string;
};

export type Tour = {
  id: TourId;
  steps: TourStep[];
};

function step(tourId: TourId, name: string, target: string): TourStep {
  return {
    target,
    titleKey: `${tourId}.${name}.title`,
    bodyKey: `${tourId}.${name}.body`,
  };
}

export const tours: Tour[] = [
  {
    id: "dashboard",
    steps: [
      step("dashboard", "health", "dashboard-health"),
      step("dashboard", "edit", "dashboard-edit"),
      step("dashboard", "menu", "dashboard-menu"),
      step("dashboard", "notifications", "dashboard-notifications"),
    ],
  },
  {
    id: "projects",
    steps: [
      step("projects", "list", "projects-list"),
      step("projects", "home", "projects-home"),
      step("projects", "add", "projects-add"),
    ],
  },
  {
    id: "editor",
    steps: [
      step("editor", "modes", "editor-modes"),
      step("editor", "devices", "editor-devices"),
      step("editor", "sections", "editor-sections"),
      step("editor", "rewrite", "editor-rewrite"),
      step("editor", "save", "editor-save"),
    ],
  },
  {
    id: "seo",
    steps: [
      step("seo", "intro", "seo-intro"),
      step("seo", "page", "seo-page"),
      step("seo", "save", "seo-save"),
    ],
  },
  {
    id: "tracking",
    steps: [
      step("tracking", "intro", "tracking-intro"),
      step("tracking", "fields", "tracking-fields"),
      step("tracking", "save", "tracking-save"),
    ],
  },
];

export function getTour(id: TourId): Tour {
  const tour = tours.find((candidate) => candidate.id === id);

  if (!tour) {
    throw new Error(`Unknown tour: ${id}`);
  }

  return tour;
}
