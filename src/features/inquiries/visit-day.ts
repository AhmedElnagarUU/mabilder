const HOUR_MS = 60 * 60 * 1000;
const VISIT_MONTHS_AHEAD = 12;
// The server does not know the visitor's time zone: "today" is anywhere from UTC-12 to UTC+14.
const LAST_ZONE_BEHIND_HOURS = 12;
const FIRST_ZONE_AHEAD_HOURS = 14;

function toDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

// A real calendar day (YYYY-MM-DD), not earlier than today for any visitor, at most 12 months ahead.
export function isVisitDayAllowed(day: string, now: Date = new Date()): boolean {
  const parsed = new Date(`${day}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime()) || toDay(parsed) !== day) {
    return false;
  }

  const earliest = toDay(new Date(now.getTime() - LAST_ZONE_BEHIND_HOURS * HOUR_MS));
  const latest = new Date(now.getTime() + FIRST_ZONE_AHEAD_HOURS * HOUR_MS);
  latest.setUTCMonth(latest.getUTCMonth() + VISIT_MONTHS_AHEAD);

  return day >= earliest && day <= toDay(latest);
}
