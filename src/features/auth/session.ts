import { headers } from "next/headers";
import { touchLastActive } from "@/features/activity/service";
import { redirect } from "@/shared/i18n/navigation";
import { getAuth, type Auth } from "./auth";

export type Session = Auth["$Infer"]["Session"];
export type SessionUser = Session["user"];

export async function getSession(
  requestHeaders: Headers,
): Promise<Session | null> {
  const auth = await getAuth();
  return auth.api.getSession({ headers: requestHeaders });
}

export async function requireSession(
  requestHeaders: Headers,
): Promise<SessionUser | null> {
  const session = await getSession(requestHeaders);

  if (!session) {
    return null;
  }

  void touchLastActive(session.user.id);
  return session.user;
}

export function unauthorizedResponse(): Response {
  return Response.json(
    { error: "Sign in to continue.", code: "unauthorized" },
    { status: 401 },
  );
}

export async function requirePageUser(
  locale: string,
  nextPath: string,
): Promise<SessionUser> {
  const user = await requireSession(await headers());

  if (!user) {
    return redirect({
      href: { pathname: "/sign-in", query: { next: nextPath } },
      locale,
    });
  }

  return user;
}
