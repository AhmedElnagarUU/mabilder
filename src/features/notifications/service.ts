import { dispatchQueuedEmails } from "./dispatch";
import {
  countUnread,
  findAdminRecipients,
  findNotifications,
  findRecipient,
  insertNotificationWithEmail,
  markRead,
} from "./repository";
import {
  parseParams,
  type NotificationList,
  type NotificationParams,
  type NotificationRecipient,
  type NotificationType,
} from "./types";

const LIST_LIMIT = 20;

function dispatchInBackground(): void {
  void dispatchQueuedEmails().catch((error: unknown) => {
    console.error("Failed to send queued emails.", error);
  });
}

async function store<T extends NotificationType>(
  recipient: NotificationRecipient,
  type: T,
  params: NotificationParams[T],
): Promise<void> {
  await insertNotificationWithEmail(recipient, type, parseParams(type, params), new Date());
}

// A notification must never break the action that caused it: failures are logged, not thrown.
export async function notify<T extends NotificationType>(
  userId: string,
  type: T,
  params: NotificationParams[T],
): Promise<void> {
  try {
    const recipient = await findRecipient(userId);

    if (!recipient) {
      console.error("Cannot notify: the user has no email address.");
      return;
    }

    await store(recipient, type, params);
    dispatchInBackground();
  } catch (error) {
    console.error("Failed to create a notification.", error);
  }
}

export async function notifyAdmins<T extends NotificationType>(
  type: T,
  params: NotificationParams[T],
): Promise<void> {
  try {
    const admins = await findAdminRecipients();

    for (const admin of admins) {
      await store(admin, type, params);
    }

    if (admins.length > 0) {
      dispatchInBackground();
    }
  } catch (error) {
    console.error("Failed to notify the admins.", error);
  }
}

export async function listNotifications(userId: string): Promise<NotificationList> {
  const [items, unreadCount] = await Promise.all([
    findNotifications(userId, LIST_LIMIT),
    countUnread(userId),
  ]);

  return { items, unreadCount };
}

export async function markNotificationsRead(
  userId: string,
  ids: string[] | undefined,
): Promise<void> {
  await markRead(userId, ids, new Date());
}
