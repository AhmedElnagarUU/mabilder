import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSite } from "../site-creation/service";
import { renderSite } from "../static-site-generator/render-site";
import { getTemplate, isTemplateId } from "../static-site-generator/site-templates/registry";
import { getThemeAssetsDirectory } from "../static-site-generator/site-paths";
import { getTheme } from "../static-site-generator/themes/registry";
import { applyTemplate } from "./apply-template";

// Owner-only preview of the owner's own content in one template. Rendered on the fly, nothing is
// saved. Rendered without a site runtime, so the contact form has no real endpoint.

export type OwnerPreviewFile = { content: string; contentType: string };

const assetContentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

function previewBase(siteId: string, templateId: string, directory: string): string {
  return `/api/sites/${siteId}/template-preview/${templateId}/${directory}`;
}

async function readAsset(templateId: string, name: string): Promise<OwnerPreviewFile | null> {
  const theme = getTheme(getTemplate(templateId).shell);
  const contentType = assetContentTypes[path.extname(name)];

  if (!contentType || !theme.assets.includes(name)) {
    return null;
  }

  try {
    const content = await readFile(path.join(getThemeAssetsDirectory(theme.id), name), "utf8");
    return { content, contentType };
  } catch {
    return null;
  }
}

// `segments` is the optional catch-all after the template id: [] is the site's first file,
// ["assets", "site.css"] a theme asset, anything else a rendered page path such as ["en", "about.html"].
export async function renderOwnerTemplatePreview(
  ownerId: string,
  siteId: string,
  templateId: string,
  segments: string[] | undefined,
): Promise<OwnerPreviewFile | null> {
  const site = await getSite(ownerId, siteId);

  if (!site?.content || !isTemplateId(templateId)) {
    return null;
  }

  const parts = segments?.filter(Boolean) ?? [];

  if (parts[0] === "assets" && parts.length === 2) {
    return readAsset(templateId, parts[1]);
  }

  const fileName = parts.length === 0 ? "index.html" : parts.join("/");
  const file = renderSite(applyTemplate(site.content, templateId)).find(
    (candidate) => candidate.fileName === fileName,
  );

  if (!file) {
    return null;
  }

  const slash = file.fileName.lastIndexOf("/");
  const directory = slash === -1 ? "" : file.fileName.slice(0, slash + 1);
  const base = previewBase(siteId, templateId, directory);

  return {
    content: file.html.replace("<head>", `<head>\n  <base href="${base}">`),
    contentType: "text/html; charset=utf-8",
  };
}
