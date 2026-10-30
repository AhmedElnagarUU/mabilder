import type { LocalizedText, Project, ProjectsSite } from "../types";

export type Locale = ProjectsSite["defaultLocale"];
export type LocalizedValue = Record<Locale, string>;
export type PhotoState = { url: string; alt: string };

export const textKeys = [
  "title",
  "location",
  "client",
  "duration",
  "description",
  "challenge",
  "solution",
  "result",
  "categoryOther",
] as const;

export type TextKey = (typeof textKeys)[number];

export type FormState = {
  text: Record<TextKey, LocalizedValue>;
  categoryKey: string;
  status: string;
  year: string;
  area: string;
  scope: string[];
  photos: PhotoState[];
  beforePhotos: PhotoState[];
  showOnHome: boolean;
};

function valueOf(field: LocalizedText | undefined): LocalizedValue {
  return { en: field?.en ?? "", ar: field?.ar ?? "" };
}

function toPhotoStates(photos: Project["photos"] | undefined): PhotoState[] {
  return photos?.map((photo) => ({ url: photo.url, alt: photo.alt ?? "" })) ?? [];
}

// A project saved before categories existed has only free text: it opens as "Other".
function categoryKeyOf(project: Project | undefined): string {
  if (project?.categoryKey) {
    return project.categoryKey;
  }

  return project?.category?.en || project?.category?.ar ? "other" : "";
}

export function toFormState(project: Project | undefined): FormState {
  return {
    text: {
      title: valueOf(project?.title),
      location: valueOf(project?.location),
      client: valueOf(project?.client),
      duration: valueOf(project?.duration),
      description: valueOf(project?.description),
      challenge: valueOf(project?.challenge),
      solution: valueOf(project?.solution),
      result: valueOf(project?.result),
      categoryOther: valueOf(project?.category),
    },
    categoryKey: categoryKeyOf(project),
    status: project?.status ?? "",
    year: project?.year ?? "",
    area: project?.area === undefined ? "" : String(project.area),
    scope: project?.scope ?? [],
    photos: toPhotoStates(project?.photos),
    beforePhotos: toPhotoStates(project?.beforePhotos),
    showOnHome: project?.showOnHome ?? true,
  };
}

function usablePhotos(photos: PhotoState[]): PhotoState[] {
  return photos.filter((photo) => photo.url.trim() !== "");
}

export function toRequestBody(state: FormState) {
  const { categoryOther, ...text } = state.text;
  const area = Number(state.area);

  return {
    ...text,
    category: state.categoryKey === "other" ? categoryOther : undefined,
    categoryKey: state.categoryKey || undefined,
    status: state.status || undefined,
    year: state.year,
    area: state.area.trim() !== "" && Number.isFinite(area) ? area : undefined,
    scope: state.scope.length > 0 ? state.scope : undefined,
    photos: usablePhotos(state.photos),
    beforePhotos: usablePhotos(state.beforePhotos),
    showOnHome: state.showOnHome,
  };
}
