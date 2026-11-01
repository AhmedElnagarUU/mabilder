import type { Locale } from "../static-site-generator/locale";
import type { SiteContent } from "../static-site-generator/site-content";
import { changeBlockDesign } from "./content-ops";
import { buildPreviewDocument } from "./preview-document";

export const DESIGN_PREVIEW_WIDTH = 1280;
export const DESIGN_PREVIEW_HEIGHT = 800;

function isolateStyle(blockId: string): string {
  const id = blockId.replace(/["\\]/g, "");

  return `
body > *:not(script):not(style):not([data-block="${id}"]) { display: none !important; }
.reveal { opacity: 1 !important; transform: none !important; transition: none !important; }
html, body { overflow: hidden; }
`;
}

export function buildDesignPreviewDocument(
  content: SiteContent,
  siteId: string,
  pageId: string,
  blockId: string,
  designId: string,
  locale: Locale,
): string {
  const page = content.pages.find((candidate) => candidate.id === pageId);

  if (!page) {
    return "";
  }

  const swapped = changeBlockDesign(content, pageId, blockId, designId);
  const html = buildPreviewDocument(swapped, siteId, page.slug, locale);

  return html.replace("</head>", `<style>${isolateStyle(blockId)}</style>\n</head>`);
}
