import { deleteCreditUse, insertCreditUse, readWindowUsage, type WindowUsage } from "./repository";
import { DAILY_CREDITS, WINDOW_HOURS } from "./plans";
import type { CreditBalance, SpendResult } from "./types";

const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;

function toBalance(usage: WindowUsage): CreditBalance {
  return {
    limit: DAILY_CREDITS,
    used: usage.used,
    left: Math.max(0, DAILY_CREDITS - usage.used),
    nextResetAt: usage.oldestAt ? new Date(usage.oldestAt.getTime() + WINDOW_MS).toISOString() : null,
  };
}

function readUsage(ownerId: string): Promise<WindowUsage> {
  return readWindowUsage(ownerId, new Date(Date.now() - WINDOW_MS));
}

export async function getBalance(ownerId: string): Promise<CreditBalance> {
  return toBalance(await readUsage(ownerId));
}

// Reserves the credits first and checks the total afterwards. Two parallel requests can
// never both pass when only one fits: at least one of them sees the other's row and
// gives its own back. Call refund() when the work the credits paid for failed.
export async function spend(
  ownerId: string,
  cost: number,
  reason: string,
  siteId?: string,
): Promise<SpendResult> {
  const useId = await insertCreditUse({ ownerId, cost, reason, siteId });
  const balance = await getBalance(ownerId);

  if (balance.used > DAILY_CREDITS) {
    await deleteCreditUse(useId);
    return { ok: false, nextResetAt: balance.nextResetAt };
  }

  return { ok: true, useId };
}

export async function refund(useId: string): Promise<void> {
  await deleteCreditUse(useId);
}
