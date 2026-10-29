import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderSite, type RenderedFile } from "./render-site";
import type { SiteContent } from "./site-content";
import { getSiteDirectory, getThemeAssetsDirectory } from "./site-paths";
import { getTheme } from "./themes/registry";
import type { Theme } from "./themes/types";

async function copyAssets(theme: Theme, outputDirectory: string): Promise<void> {
  const outputAssetsDirectory = path.join(outputDirectory, "assets");
  await mkdir(outputAssetsDirectory, { recursive: true });

  for (const assetName of theme.assets) {
    await copyFile(
      path.join(getThemeAssetsDirectory(theme.id), assetName),
      path.join(outputAssetsDirectory, assetName),
    );
  }
}

async function writeRenderedFile(
  outputDirectory: string,
  file: RenderedFile,
): Promise<void> {
  const filePath = path.join(outputDirectory, file.fileName);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, file.html, "utf8");
}

export async function generateSite(
  siteId: string,
  content: SiteContent,
  headExtra = "",
): Promise<void> {
  const outputDirectory = getSiteDirectory(siteId);
  const theme = getTheme(content.theme);
  const files = renderSite(content, headExtra);

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await copyAssets(theme, outputDirectory);

  for (const file of files) {
    await writeRenderedFile(outputDirectory, file);
  }
}

export async function deleteGeneratedSite(siteId: string): Promise<void> {
  await rm(getSiteDirectory(siteId), { recursive: true, force: true });
}
