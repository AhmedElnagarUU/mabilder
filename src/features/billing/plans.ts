export const TRIAL_DAYS = 15;

export const DAY_MS = 24 * 60 * 60 * 1000;

// Jan 31 + 1 month is Feb 28/29, not early March.
export function addOneMonth(date: Date): Date {
  const next = new Date(date.getTime());
  const day = next.getUTCDate();

  next.setUTCDate(1);
  next.setUTCMonth(next.getUTCMonth() + 1);
  next.setUTCDate(Math.min(day, daysInMonth(next)));

  return next;
}

function daysInMonth(date: Date): number {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
}
