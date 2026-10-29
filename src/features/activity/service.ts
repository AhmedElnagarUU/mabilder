import {
  findRecentActivity,
  hasActivitySince,
  insertActivity,
  setLastActiveIfStale,
} from "./repository";
import {
  activityEventSchema,
  type ActivityEventInput,
  type ActivityItem,
} from "./types";

const LAST_ACTIVE_INTERVAL_MS = 5 * 60 * 1000;
const CONTENT_SAVED_INTERVAL_MS = 10 * 60 * 1000;

// Activity must never break the action that caused it: failures are logged, not thrown.
export async function recordActivity(event: ActivityEventInput): Promise<void> {
  try {
    await insertActivity(activityEventSchema.parse(event));
  } catch (error) {
    console.error("Failed to record activity.", error);
  }
}

// The editor autosaves often, so one content_saved event per site per 10 minutes is enough.
export async function recordContentSaved(
  userId: string,
  siteId: string,
): Promise<void> {
  try {
    const since = new Date(Date.now() - CONTENT_SAVED_INTERVAL_MS);

    if (await hasActivitySince(userId, siteId, "content_saved", since)) {
      return;
    }
  } catch (error) {
    console.error("Failed to check recent activity.", error);
    return;
  }

  await recordActivity({ userId, actorId: userId, type: "content_saved", siteId });
}

export async function listRecentActivity(
  userId: string,
  limit: number,
): Promise<ActivityItem[]> {
  return findRecentActivity(userId, limit);
}

export async function touchLastActive(userId: string): Promise<void> {
  try {
    const now = new Date();
    const staleBefore = new Date(now.getTime() - LAST_ACTIVE_INTERVAL_MS);
    await setLastActiveIfStale(userId, now, staleBefore);
  } catch (error) {
    console.error("Failed to update the last active time.", error);
  }
}
