import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { projectErrorResponse, projectResultResponse } from "@/features/projects/responses";
import { deleteProject, updateProject } from "@/features/projects/service";

export const dynamic = "force-dynamic";

export async function PUT(
  request: Request,
  context: RouteContext<"/api/projects/[projectId]">,
) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const { projectId } = await context.params;
    const result = await updateProject(user.id, projectId, await request.json());
    return projectResultResponse(result, (project) => ({ project }));
  } catch (error) {
    return projectErrorResponse(error);
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext<"/api/projects/[projectId]">,
) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const { projectId } = await context.params;
    const result = await deleteProject(user.id, projectId);
    return projectResultResponse(result, () => ({ ok: true }));
  } catch (error) {
    return projectErrorResponse(error);
  }
}
