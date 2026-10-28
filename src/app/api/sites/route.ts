import { requireSession, unauthorizedResponse } from "@/features/auth/session";
import { createSite, listSites } from "@/features/site-creation/service";
import { databaseErrorResponse } from "@/shared/db/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    return Response.json({ sites: await listSites(user.id) });
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to load the sites.", code: "load_failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSession(request.headers);

    if (!user) {
      return unauthorizedResponse();
    }

    const result = await createSite(user.id, await request.json());

    if (!result.ok && result.code === "site_exists") {
      return Response.json(
        { error: "This account already has a website.", code: "site_exists" },
        { status: 409 },
      );
    }

    if (!result.ok) {
      return Response.json(
        { error: "Invalid request.", code: "invalid_request", errors: result.errors },
        { status: 400 },
      );
    }

    return Response.json({ site: result.site }, { status: 201 });
  } catch (error) {
    const unavailable = databaseErrorResponse(error);

    if (unavailable) {
      return unavailable;
    }

    console.error(error);
    return Response.json(
      { error: "Failed to create the site.", code: "create_failed" },
      { status: 500 },
    );
  }
}
