import { escapeAttribute, escapeHtml } from "../../content/html";
import type { Locale } from "../../locale";
import type { AlternatePage, PageContext } from "../types";

const latinFonts =
  "family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@400;500;600";
const arabicFont = "&family=IBM+Plex+Sans+Arabic:wght@400;500;600";

function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

function getFontUrl(locale: Locale): string {
  const arabic = locale === "ar" ? arabicFont : "";
  return `https://fonts.googleapis.com/css2?${latinFonts}${arabic}&display=swap`;
}

function getFontFamilies(locale: Locale): string {
  const arabic = locale === "ar" ? "'IBM Plex Sans Arabic', " : "";
  return `sans: ['DM Sans', ${arabic}'sans-serif'], display: ['Cormorant Garamond', ${arabic}'serif']`;
}

function renderAlternateLink(alternate: AlternatePage | undefined): string {
  if (!alternate) {
    return "";
  }

  return `
  <link rel="alternate" hreflang="${escapeAttribute(alternate.locale)}" href="${escapeAttribute(alternate.href)}" />`;
}

export function renderDocument(context: PageContext, body: string, headExtra: string): string {
  const { locale, meta, rootPath } = context;

  return `<!DOCTYPE html>
<html lang="${escapeAttribute(locale)}" dir="${getDirection(locale)}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(meta.title)}</title>
  <meta name="description" content="${escapeAttribute(meta.description)}" />${renderAlternateLink(context.alternate)}
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="${escapeAttribute(getFontUrl(locale))}" rel="stylesheet" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { ${getFontFamilies(locale)} },
          colors: { cream: '#F4EFE6', charcoal: '#1C1C1C', brass: '#B8956C', sand: '#E9E2D6' }
        }
      }
    }
  </script>
  <link rel="stylesheet" href="${escapeAttribute(rootPath)}assets/site.css" />
${headExtra}
</head>
<body class="bg-cream text-charcoal font-sans">
${body}
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="${escapeAttribute(rootPath)}assets/site.js"></script>
</body>
</html>
`;
}
