import { ADMIN_LOGIN_DISABLED_MESSAGE } from "@/features/admin/auth/config";
import { buildClearedCookie, buildSessionCookie } from "@/features/admin/auth/cookie";
import { loginAdmin, type LoginResult } from "@/features/admin/auth/login";

export const dynamic = "force-dynamic";

const failures = {
  login_disabled: { status: 503, error: ADMIN_LOGIN_DISABLED_MESSAGE },
  invalid_request: { status: 400, error: "Enter the admin email and password." },
  too_many_attempts: { status: 429, error: "Too many failed attempts. Try again later." },
  invalid_credentials: { status: 401, error: "The email or password is incorrect." },
} as const;

function clientId(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

function toResponse(result: LoginResult): Response {
  if (result.ok) {
    return Response.json(
      { ok: true },
      { headers: { "Set-Cookie": buildSessionCookie(result.token, result.maxAgeSeconds) } },
    );
  }

  const failure = failures[result.code];
  return Response.json(
    { error: failure.error, code: result.code },
    { status: failure.status },
  );
}

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  return toResponse(loginAdmin(body, clientId(request)));
}

export async function DELETE() {
  return Response.json({ ok: true }, { headers: { "Set-Cookie": buildClearedCookie() } });
}
