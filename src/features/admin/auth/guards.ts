import { headers } from "next/headers";
import { redirect } from "@/shared/i18n/navigation";
import { hasValidAdminSession } from "./cookie";

export async function requireAdminPage(locale: string): Promise<void> {
  const cookieHeader = (await headers()).get("cookie");

  if (!hasValidAdminSession(cookieHeader)) {
    redirect({ href: "/admin/login", locale });
  }
}

// Returns the 401 response to send, or null when the request carries a valid admin session.
export function requireAdminApi(request: Request): Response | null {
  if (hasValidAdminSession(request.headers.get("cookie"))) {
    return null;
  }

  return Response.json(
    { error: "Admin sign-in required.", code: "unauthorized" },
    { status: 401 },
  );
}
