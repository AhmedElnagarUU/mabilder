import { getSessionCookie } from "better-auth/cookies";
import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./shared/i18n/routing";

const intlMiddleware = createMiddleware(routing);

const PROTECTED_PATH = new RegExp(
  `^/(${routing.locales.join("|")})(/(?:dashboard|edit)(?:/.*)?)$`,
);

function signInRedirect(request: NextRequest): NextResponse | null {
  const match = PROTECTED_PATH.exec(request.nextUrl.pathname);

  if (!match || getSessionCookie(request)) {
    return null;
  }

  const [, locale, path] = match;
  const url = new URL(`/${locale}/sign-in`, request.url);
  url.searchParams.set("next", `${path}${request.nextUrl.search}`);

  return NextResponse.redirect(url);
}

// Optimistic redirect only; pages and APIs check the session on the server.
export default function proxy(request: NextRequest) {
  return signInRedirect(request) ?? intlMiddleware(request);
}

export const config = {
  matcher: "/((?!api|preview|_next|_vercel|.*\\..*).*)",
};
