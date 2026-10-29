import path from "node:path";

const siteIdPattern = /^[a-zA-Z0-9_-]+$/;

export function getAgenvoAssetsDirectory(): string {
  return path.join(
    process.cwd(),
    "src",
    "features",
    "static-site-generator",
    "assets",
  );
}

export function getThemeAssetsDirectory(themeId: string): string {
  return path.join(
    process.cwd(),
    "src",
    "features",
    "static-site-generator",
    "themes",
    themeId,
    "assets",
  );
}

export function getSiteDirectory(siteId: string): string {
  if (!siteIdPattern.test(siteId)) {
    throw new Error("Invalid site id.");
  }

  return path.join(process.cwd(), "generated-sites", siteId);
}

export function getPreviewPath(
  siteId: string,
  file = "index.html",
): string {
  return `/preview/${siteId}/${file}`;
}

export function getContentFilePath(): string {
  return path.join(process.cwd(), "content", "agenvo.json");
}
