import { getEmailProvider } from "./email/index";
import type { EmailProvider } from "./email/provider";
import {
  claimQueuedEmail,
  markEmailFailed,
  markEmailRetry,
  markEmailSent,
} from "./repository";
import { renderEmail } from "./templates";
import { parseParams, type QueuedEmail } from "./types";

const MAX_ATTEMPTS = 5;
const BACKOFF_MINUTES = [1, 5, 15, 60];
const CLAIM_MS = 5 * 60 * 1000;
const MAX_ERROR_LENGTH = 200;

function errorText(error: unknown): string {
  const message = error instanceof Error ? error.message : "Unknown error.";
  return message.slice(0, MAX_ERROR_LENGTH);
}

async function sendEmail(item: QueuedEmail, provider: EmailProvider): Promise<void> {
  const email = renderEmail(item.type, item.locale, parseParams(item.type, item.params));
  await provider.send({ to: item.to, ...email });
}

async function recordFailure(item: QueuedEmail, error: unknown, now: Date): Promise<void> {
  const attempts = item.attempts + 1;
  const lastError = errorText(error);

  if (attempts >= MAX_ATTEMPTS) {
    await markEmailFailed(item.id, attempts, lastError);
    return;
  }

  const delayMs = BACKOFF_MINUTES[attempts - 1] * 60 * 1000;
  await markEmailRetry(item.id, attempts, new Date(now.getTime() + delayMs), lastError);
}

async function processEmail(
  item: QueuedEmail,
  provider: EmailProvider,
  now: Date,
): Promise<void> {
  try {
    await sendEmail(item, provider);
  } catch (error) {
    await recordFailure(item, error, now);
    return;
  }

  await markEmailSent(item.id);
}

// `provider` and `now` are injectable so tests control sending and time.
export async function dispatchQueuedEmails(
  limit = 20,
  provider: EmailProvider = getEmailProvider(),
  now: Date = new Date(),
): Promise<number> {
  let processed = 0;

  while (processed < limit) {
    const item = await claimQueuedEmail(now, new Date(now.getTime() + CLAIM_MS));

    if (!item) {
      break;
    }

    await processEmail(item, provider, now);
    processed += 1;
  }

  return processed;
}
