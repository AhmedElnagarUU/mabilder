import { readAdminConfig } from "./config";
import { verifyAdminSession } from "./token";

export const ADMIN_COOKIE_NAME = "admin_session";

function cookieAttributes(maxAgeSeconds: number): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function buildSessionCookie(token: string, maxAgeSeconds: number): string {
  return `${ADMIN_COOKIE_NAME}=${token}; ${cookieAttributes(maxAgeSeconds)}`;
}

export function buildClearedCookie(): string {
  return `${ADMIN_COOKIE_NAME}=; ${cookieAttributes(0)}`;
}

function readSessionToken(cookieHeader: string | null): string | null {
  const prefix = `${ADMIN_COOKIE_NAME}=`;
  const pair = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  return pair ? pair.slice(prefix.length) : null;
}

// The signed expiry is checked on every request, not only when the cookie is created.
export function hasValidAdminSession(
  cookieHeader: string | null,
  nowMs: number = Date.now(),
): boolean {
  const config = readAdminConfig();
  const token = readSessionToken(cookieHeader);

  return Boolean(config && token && verifyAdminSession(token, config.secret, nowMs));
}
