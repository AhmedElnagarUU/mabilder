import { generateDemoSite, demoPreviewPath } from "@/features/static-site-generator/demo-site";

export async function POST() {
  try {
    await generateDemoSite();
    return Response.json({ previewUrl: demoPreviewPath });
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "Failed to generate the site." },
      { status: 500 },
    );
  }
}
