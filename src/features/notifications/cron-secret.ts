import { createHash, timingSafeEqual } from "node:crypto";

export type CronSecretCheck = "ok" | "unauthorized" | "unconfigured";

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

export function checkCronSecret(header: string | null): CronSecretCheck {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return "unconfigured";
  }

  if (!header) {
    return "unauthorized";
  }

  return timingSafeEqual(digest(header), digest(secret)) ? "ok" : "unauthorized";
}
