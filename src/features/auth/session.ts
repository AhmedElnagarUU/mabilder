import { headers } from "next/headers";
import { touchLastActive } from "@/features/activity/service";
import { redirect } from "@/shared/i18n/navigation";
import { getAuth, type Auth } from "./auth";
import { ACCOUNT_INACTIVE_CODE } from "./inactive";

export type Session = Auth["$Infer"]["Session"];
export type SessionUser = Session["user"];

async function findSession(requestHeaders: Headers): Promise<Session | null> {
  const auth = await getAuth();
  return auth.api.getSession({ headers: requestHeaders });
}

// A deactivated account is treated as signed out.
export async function getSession(
  requestHeaders: Headers,
): Promise<Session | null> {
  const session = await findSession(requestHeaders);
  return session?.user.inactive ? null : session;
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

// Called when requireSession found no user: a deactivated account gets 403, anyone else 401.
export async function unauthorizedResponse(): Promise<Response> {
  const session = await findSession(await headers());

  if (session?.user.inactive) {
    return Response.json(
      { error: "This account is deactivated.", code: ACCOUNT_INACTIVE_CODE },
      { status: 403 },
    );
  }

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
