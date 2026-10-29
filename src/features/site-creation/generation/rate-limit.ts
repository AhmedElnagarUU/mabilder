const maxAttempts = 2;
const timeoutMs = 90_000;

let minIntervalMs = 1_000;
let nextStartAt = 0;

// Gap between AI request starts. Tests set it to 0; they never call a real provider.
export function setMinIntervalMs(ms: number): void {
  minIntervalMs = ms;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForStartSlot(): Promise<void> {
  const now = Date.now();
  const startAt = Math.max(now, nextStartAt);

  nextStartAt = startAt + minIntervalMs;

  if (startAt > now) {
    await sleep(startAt - now);
  }
}

function statusOf(error: unknown): number | null {
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const status = (error as { status?: unknown }).status;
  return typeof status === "number" ? status : null;
}

export function isRateLimit(error: unknown): boolean {
  const status = statusOf(error);

  return (
    status === 429 ||
    (error instanceof Error &&
      /429|Too Many Requests|quota/i.test(error.message))
  );
}

export function isRetryable(error: unknown): boolean {
  const status = statusOf(error);

  return (
    isRateLimit(error) ||
    (status !== null && status >= 500) ||
    (error instanceof Error && /503|Service Unavailable/i.test(error.message))
  );
}

function retryDelayMs(error: unknown): number {
  const message = error instanceof Error ? error.message : "";
  const match = message.match(/"retryDelay"\s*:\s*"([\d.]+)s"/);

  if (match) {
    return Math.ceil(Number(match[1]) * 1000);
  }

  return isRateLimit(error) ? 60_000 : 10_000;
}

export function requestOptions(signal: AbortSignal): { signal: AbortSignal } {
  return { signal: AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]) };
}

function withTimeout<T>(task: () => Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error("The AI request timed out."));
    }, timeoutMs);
  });

  // Promise.resolve().then: a task that throws synchronously still clears the timer.
  return Promise.race([Promise.resolve().then(task), timeout]).finally(() => {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  });
}

export async function runRateLimited<T>(
  task: () => Promise<T>,
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    await waitForStartSlot();

    try {
      return await withTimeout(task);
    } catch (error) {
      if (!isRetryable(error) || attempt === maxAttempts) {
        throw error;
      }

      await sleep(retryDelayMs(error));
    }
  }

  throw new Error("Rate limit retries exhausted.");
}
