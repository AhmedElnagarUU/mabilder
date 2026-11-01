import { escapeHtml } from "@/features/static-site-generator/content/html";
import {
  findPreviewAsset,
  findPreviewPage,
  listPreviewParams,
} from "@/features/templates-gallery/preview";
import { getTranslations } from "next-intl/server";

export function generateStaticParams() {
  // The optional catch-all must include the base path ([] matches "/preview" without segments).
  return listPreviewParams().map((param) => ({
    locale: param.locale,
    id: param.id,
    file: param.file,
  }));
}

function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  request: Request,
  context: RouteContext<"/[locale]/templates/[id]/preview/[[...file]]">,
) {
  const { locale, id, file } = await context.params;

  // Theme assets (site.css, site.js) are served from the same catch-all, matching "assets/<name>".
  const asset = await findPreviewAsset(id, locale, file);

  if (asset) {
    return new Response(asset.content, {
      headers: {
        "Content-Type": asset.contentType,
        "Cache-Control": "public, max-age=3600, must-revalidate",
      },
    });
  }

  const page = findPreviewPage(id, locale, file);

  if (!page) {
    return notFound();
  }

  // Visible demo ribbon injected into the fully rendered page. It is part of this route only:
  // neither the template output nor the real generated sites change.
  const t = await getTranslations({ locale, namespace: "templatesGallery.page" });

  const ribbon = [
    `<div role="note" style="position:fixed;inset-block-end:0;inset-inline:0;z-index:9999;`,
    `padding:10px 16px;background:#111317;color:#f5f5f4;font:500 12px/1.5 system-ui,sans-serif;`,
    `text-align:center;border-top:1px solid rgba(255,255,255,0.15);">`,
    `${escapeHtml(t("ribbon"))} `,
    `<a href="/${escapeHtml(locale)}/templates" style="color:#93c5fd;text-decoration:underline;">`,
    `${escapeHtml(t("ribbonLink"))}</a></div>`,
  ].join("");

  const html = page.html.replace("</body>", `${ribbon}\n</body>`);

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
