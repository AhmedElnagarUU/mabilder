import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const demoPreviewPath = "/preview/index.html";

export function getDemoSiteDirectory(): string {
  return path.join(process.cwd(), "generated-sites", "demo-site");
}

export async function generateDemoSite(): Promise<void> {
  const generatorScript = path.join(
    process.cwd(),
    ".generator-build",
    "scripts",
    "generate-site.js",
  );

  await execFileAsync(process.execPath, [generatorScript], {
    cwd: process.cwd(),
    windowsHide: true,
  });
}
