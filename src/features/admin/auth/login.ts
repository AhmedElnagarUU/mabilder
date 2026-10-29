import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { readAdminConfig, type AdminConfig } from "./config";
import { clearFailedLogins, isThrottled, recordFailedLogin } from "./throttle";
import { ADMIN_SESSION_SECONDS, signAdminSession } from "./token";

export const loginSchema = z.object({
  email: z.string().trim().min(1).max(200),
  password: z.string().min(1).max(200),
});

export type LoginResult =
  | { ok: true; token: string; maxAgeSeconds: number }
  | { ok: false; code: "login_disabled" | "invalid_request" | "too_many_attempts" | "invalid_credentials" };

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function sameText(given: string, expected: string): boolean {
  return timingSafeEqual(digest(given), digest(expected));
}

function matchesCredentials(
  config: AdminConfig,
  email: string,
  password: string,
): boolean {
  const emailMatches = sameText(email.toLowerCase(), config.email.toLowerCase());
  const passwordMatches = sameText(password, config.password);
  return emailMatches && passwordMatches;
}

export function loginAdmin(
  body: unknown,
  clientId: string,
  nowMs: number = Date.now(),
): LoginResult {
  const config = readAdminConfig();

  if (!config) {
    return { ok: false, code: "login_disabled" };
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return { ok: false, code: "invalid_request" };
  }

  if (isThrottled(clientId, nowMs)) {
    return { ok: false, code: "too_many_attempts" };
  }

  if (!matchesCredentials(config, parsed.data.email, parsed.data.password)) {
    recordFailedLogin(clientId, nowMs);
    return { ok: false, code: "invalid_credentials" };
  }

  clearFailedLogins(clientId);

  return {
    ok: true,
    token: signAdminSession(config.secret, nowMs + ADMIN_SESSION_SECONDS * 1000),
    maxAgeSeconds: ADMIN_SESSION_SECONDS,
  };
}
