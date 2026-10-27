import { renderAttribute, escapeHtml } from "../content/html";

export function renderDocument(
  title: string,
  description: string,
  body: string,
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${renderAttribute(description)}" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: { sans: ['DM Sans', 'sans-serif'], display: ['Cormorant Garamond', 'serif'] },
          colors: { cream: '#F4EFE6', charcoal: '#1C1C1C', brass: '#B8956C', sand: '#E9E2D6' }
        }
      }
    }
  </script>
  <link rel="stylesheet" href="assets/site.css" />
</head>
<body class="bg-cream text-charcoal font-sans">
${body}
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="assets/site.js"></script>
</body>
</html>
`;
}
