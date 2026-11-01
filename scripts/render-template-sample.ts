import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { renderSite } from "../src/features/static-site-generator/render-site";
import { getThemeAssetsDirectory } from "../src/features/static-site-generator/site-paths";
import { applyTemplate } from "../src/features/site-editor/apply-template";
import { isTemplateId, getTemplate } from "../src/features/static-site-generator/site-templates/registry";
import { getTheme } from "../src/features/static-site-generator/themes/registry";
import { composeFor, richBrief, richProjects } from "../tests/pipeline/samples";

// Dev only: writes a full bilingual sample site in one template to .template-samples/<id>/. No network.
async function main(): Promise<void> {
  const templateId = process.argv[2];

  if (!templateId || !isTemplateId(templateId)) {
    console.log("Usage: npm run templates:render-sample -- <template id>");
    process.exitCode = 1;
    return;
  }

  const content = applyTemplate(composeFor(richBrief, richProjects, ["en", "ar"]), templateId);
  const theme = getTheme(getTemplate(templateId).shell);
  const directory = path.join(process.cwd(), ".template-samples", templateId);

  await rm(directory, { recursive: true, force: true });
  await mkdir(path.join(directory, "assets"), { recursive: true });

  for (const file of renderSite(content)) {
    const filePath = path.join(directory, file.fileName);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, file.html, "utf8");
  }

  for (const asset of theme.assets) {
    await copyFile(path.join(getThemeAssetsDirectory(theme.id), asset), path.join(directory, "assets", asset));
  }

  console.log(`Sample written to ${directory} (open en/index.html or ar/index.html).`);
}

void main();
