import { requireAdminApi } from "@/features/admin/auth/guards";
import { findUserSiteId } from "@/features/admin/service";
import { readGeneratedFile } from "@/features/static-site-generator/read-generated-file";

export const dynamic = "force-dynamic";

function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  request: Request,
  context: RouteContext<"/api/admin/users/[id]/preview/[...file]">,
) {
  const denied = requireAdminApi(request);

  if (denied) {
    return denied;
  }

  const { id, file } = await context.params;
  const siteId = await findUserSiteId(id);
  const generatedFile = siteId ? await readGeneratedFile(siteId, file) : null;

  if (!generatedFile) {
    return notFound();
  }

  return new Response(generatedFile.content, {
    headers: {
      "Content-Type": generatedFile.contentType,
      "Cache-Control": "no-store",
    },
  });
}
