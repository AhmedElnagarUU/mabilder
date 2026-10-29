
export type EditorMode = "structure" | "content";

export type DeviceId = "desktop" | "tablet" | "mobile";

export const deviceIds: DeviceId[] = ["desktop", "tablet", "mobile"];
export const deviceWidths: Record<DeviceId, number> = {
  desktop: 1440,
  tablet: 768,
  mobile: 390,
};

export const stageGutter = 16;
export const frameHeaderHeight = 38;
export const frameBorder = 2;

const minFitScale = 0.1;

export function fitScale(stageWidth: number, deviceWidth: number): number {
  const available = stageWidth - stageGutter * 2 - frameBorder;
  return Math.min(1, Math.max(minFitScale, available / deviceWidth));
}


