import { requireSession } from "@/features/auth/session";
import { renderOwnerTemplatePreview } from "@/features/site-editor/template-preview";

export const dynamic = "force-dynamic";

function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  request: Request,
  context: RouteContext<"/api/sites/[siteId]/template-preview/[templateId]/[[...file]]">,
) {
  const user = await requireSession(request.headers);

  if (!user) {
    return notFound();
  }

  const { siteId, templateId, file } = await context.params;
  const preview = await renderOwnerTemplatePreview(user.id, siteId, templateId, file);

  if (!preview) {
    return notFound();
  }

  return new Response(preview.content, {
    headers: { "Content-Type": preview.contentType, "Cache-Control": "no-store" },
  });
}
