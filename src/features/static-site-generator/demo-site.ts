import path from "node:path";
import { generateSite } from "./generate-site";

export const demoPreviewPath = "/preview/index.html";

export function getDemoSiteDirectory(): string {
  return path.join(process.cwd(), "generated-sites", "demo-site");
}

export async function generateDemoSite(): Promise<void> {
  await generateSite(getDemoSiteDirectory());
}
