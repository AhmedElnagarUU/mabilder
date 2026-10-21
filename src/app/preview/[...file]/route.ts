import { readGeneratedFile } from "@/features/static-site-generator/read-generated-file";

export async function GET(
  _request: Request,
  context: RouteContext<"/preview/[...file]">,
) {
  const { file } = await context.params;
  const generatedFile = await readGeneratedFile(file);

  if (!generatedFile) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(generatedFile.content, {
    headers: { "Content-Type": generatedFile.contentType },
  });
}
