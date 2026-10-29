const MAX_FAILED_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type Attempts = { count: number; resetAt: number };

// In memory and per server process: enough to slow down password guessing.
const failedByClient = new Map<string, Attempts>();

export function isThrottled(clientId: string, nowMs: number): boolean {
  const attempts = failedByClient.get(clientId);

  if (!attempts || attempts.resetAt <= nowMs) {
    return false;
  }

  return attempts.count >= MAX_FAILED_ATTEMPTS;
}

export function recordFailedLogin(clientId: string, nowMs: number): void {
  const attempts = failedByClient.get(clientId);

  if (!attempts || attempts.resetAt <= nowMs) {
    failedByClient.set(clientId, { count: 1, resetAt: nowMs + WINDOW_MS });
    return;
  }

  attempts.count += 1;
}

export function clearFailedLogins(clientId: string): void {
  failedByClient.delete(clientId);
}
