import { requireSession } from "@/features/auth/session";
import { getSite } from "@/features/site-creation/service";
import { readGeneratedFile } from "@/features/static-site-generator/read-generated-file";

export const dynamic = "force-dynamic";

function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

export async function GET(
  request: Request,
  context: RouteContext<"/preview/[siteId]/[...file]">,
) {
  const { siteId, file } = await context.params;
  const user = await requireSession(request.headers);

  if (!user || !(await getSite(user.id, siteId))) {
    return notFound();
  }

  const generatedFile = await readGeneratedFile(siteId, file);

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
