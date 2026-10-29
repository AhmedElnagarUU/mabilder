import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { projectErrorResponse, projectResultResponse } from "@/features/projects/responses";
import { createProject, getProjectsOverview } from "@/features/projects/service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const overview = await getProjectsOverview(user.id);

    if (!overview) {
      return Response.json(
        { error: "Site not found.", code: "site_not_found" },
        { status: 404 },
      );
    }

    return Response.json({ projects: overview.projects });
  } catch (error) {
    return projectErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const result = await createProject(user.id, await request.json());
    return projectResultResponse(result, (project) => ({ project }), 201);
  } catch (error) {
    return projectErrorResponse(error);
  }
}
