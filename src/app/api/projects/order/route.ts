import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { projectErrorResponse, projectResultResponse } from "@/features/projects/responses";
import { reorderProjects } from "@/features/projects/service";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const result = await reorderProjects(user.id, await request.json());
    return projectResultResponse(result, () => ({ ok: true }));
  } catch (error) {
    return projectErrorResponse(error);
  }
}
