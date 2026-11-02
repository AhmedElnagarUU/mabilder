import { escapeAttribute, escapeHtml } from "../../content/html";
import { resolveWhatsAppUrl, whatsappLabels } from "../../content/whatsapp";
import { getDirection, renderAlternateLink, renderRuntimeAttributes } from "../agenvo/document";
import type { PageContext } from "../types";

const whatsAppIcon =
  '<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9c0 3 3 6 6 6l1.2-1.4-2-1-1 .8c-.8-.4-1.6-1.2-2-2l.8-1-1-2z"/></svg>';

function renderWhatsAppButton(context: PageContext): string {
  const url = resolveWhatsAppUrl(context.runtime.whatsapp, context.content.facts.phone, context.locale);

  if (!url) {
    return "";
  }

  const label = escapeAttribute(whatsappLabels[context.locale]);

  return `
  <a data-whatsapp href="${escapeAttribute(url)}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}" class="ar-wa">${whatsAppIcon}</a>`;
}

// Fonts and the template's color variables arrive in headExtra (site-templates/head.ts), after the stylesheet.
export function renderDocument(context: PageContext, body: string, headExtra: string): string {
  const { locale, meta, rootPath } = context;

  return `<!DOCTYPE html>
<html lang="${escapeAttribute(locale)}" dir="${getDirection(locale)}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeAttribute(meta.description)}" />${renderAlternateLink(context.alternate)}
  <script>document.documentElement.classList.add("ar-js")</script>
  <link rel="stylesheet" href="${escapeAttribute(rootPath)}assets/arhitect.css" />
${headExtra}
</head>
<body class="ar"${renderRuntimeAttributes(context)}>
${body}${renderWhatsAppButton(context)}
  <script src="${escapeAttribute(rootPath)}assets/arhitect.js"></script>
</body>
</html>
`;
}
