import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SiteContent } from "./content/types";
import { getAgenvoAssetsDirectory, getSiteDirectory } from "./site-paths";
import { pageTemplates } from "./templates/registry";

async function copyAssets(outputDirectory: string): Promise<void> {
  const outputAssetsDirectory = path.join(outputDirectory, "assets");
  await mkdir(outputAssetsDirectory, { recursive: true });

  for (const assetName of ["site.css", "site.js"]) {
    await copyFile(
      path.join(getAgenvoAssetsDirectory(), assetName),
      path.join(outputAssetsDirectory, assetName),
    );
  }
}

export async function generateSite(
  siteId: string,
  content: SiteContent,
): Promise<void> {
  const outputDirectory = getSiteDirectory(siteId);

  await rm(outputDirectory, { recursive: true, force: true });
  await mkdir(outputDirectory, { recursive: true });
  await copyAssets(outputDirectory);

  for (const template of pageTemplates) {
    await writeFile(
      path.join(outputDirectory, template.fileName),
      template.render(content),
      "utf8",
    );
  }
}

export async function deleteGeneratedSite(siteId: string): Promise<void> {
  await rm(getSiteDirectory(siteId), { recursive: true, force: true });
}
