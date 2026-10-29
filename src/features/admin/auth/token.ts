import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_SECONDS = 5 * 60 * 60;

function sign(secret: string, expiresAtMs: string): Buffer {
  return createHmac("sha256", secret).update(expiresAtMs).digest();
}

// Token = "<expiry in ms>.<hex HMAC-SHA256 of the expiry>".
export function signAdminSession(secret: string, expiresAtMs: number): string {
  const expiry = String(expiresAtMs);
  return `${expiry}.${sign(secret, expiry).toString("hex")}`;
}

export function verifyAdminSession(
  token: string,
  secret: string,
  nowMs: number,
): boolean {
  const [expiry, signature, ...rest] = token.split(".");

  if (!expiry || !signature || rest.length > 0 || !/^\d+$/.test(expiry)) {
    return false;
  }

  const given = Buffer.from(signature, "hex");
  const expected = sign(secret, expiry);

  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return false;
  }

  return Number(expiry) > nowMs;
}
