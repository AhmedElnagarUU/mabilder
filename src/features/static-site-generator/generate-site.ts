import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pages } from "./pages.js";
import { renderPage } from "./render-page.js";
import { styles } from "./styles.js";

export async function generateSite(outputDirectory: string): Promise<void> {
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(path.join(outputDirectory, "styles.css"), styles, "utf8");

  for (const page of pages) {
    const fileName = `${page.slug}.html`;
    const html = renderPage(page, pages);
    await writeFile(path.join(outputDirectory, fileName), html, "utf8");
  }
}
