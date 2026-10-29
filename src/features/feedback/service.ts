import { recordActivity } from "../activity/service";
import { notify, notifyAdmins } from "../notifications/service";
import {
  countFeedback,
  findContacts,
  findFeedbackById,
  findFeedbackPage,
  insertFeedback,
  saveFeedbackReply,
  updateFeedbackStatus,
  type FeedbackContact,
  type FeedbackFilter,
} from "./repository";
import {
  FEEDBACK_PAGE_SIZE,
  type FeedbackChangeResult,
  type FeedbackEntry,
  type FeedbackListQuery,
  type FeedbackPage,
  type FeedbackRow,
  type FeedbackStatus,
  type SendFeedbackInput,
} from "./types";

const USER_FEEDBACK_LIMIT = 50;

function withAuthors(rows: FeedbackRow[], contacts: Map<string, FeedbackContact>): FeedbackEntry[] {
  return rows.map((row) => {
    const contact = contacts.get(row.userId);
    return { ...row, userName: contact?.name ?? "", userEmail: contact?.email ?? "" };
  });
}

async function findEntries(filter: FeedbackFilter, skip: number, limit: number): Promise<FeedbackEntry[]> {
  const rows = await findFeedbackPage(filter, skip, limit);
  return withAuthors(rows, await findContacts(rows.map((row) => row.userId)));
}

// Feedback must never break the request that sent it: notification failures are logged inside notifyAdmins.
export async function sendFeedback(userId: string, input: SendFeedbackInput): Promise<void> {
  await insertFeedback(input, userId, new Date());
  await recordActivity({ userId, actorId: userId, type: "feedback_sent" });

  const contact = (await findContacts([userId])).get(userId);
  await notifyAdmins("feedback_received", { userName: contact?.name || contact?.email || userId });
}

export async function listFeedback(query: FeedbackListQuery): Promise<FeedbackPage> {
  const filter: FeedbackFilter = query.status ? { status: query.status } : {};
  const [total, items] = await Promise.all([
    countFeedback(filter),
    findEntries(filter, (query.page - 1) * FEEDBACK_PAGE_SIZE, FEEDBACK_PAGE_SIZE),
  ]);

  return {
    items,
    total,
    page: query.page,
    pageSize: FEEDBACK_PAGE_SIZE,
    pageCount: Math.max(1, Math.ceil(total / FEEDBACK_PAGE_SIZE)),
  };
}

export async function listFeedbackForUser(userId: string): Promise<FeedbackEntry[]> {
  return findEntries({ userId }, 0, USER_FEEDBACK_LIMIT);
}

export function countFeedbackWithStatus(status: FeedbackStatus): Promise<number> {
  return countFeedback({ status });
}

export async function setFeedbackStatus(id: string, status: FeedbackStatus): Promise<FeedbackChangeResult> {
  if (!(await findFeedbackById(id))) {
    return "not_found";
  }

  await updateFeedbackStatus(id, status);
  return "ok";
}

// actorId is the admin's id for the activity log; the admin is not a database user, so the caller passes it in.
export async function replyToFeedback(
  actorId: string,
  id: string,
  reply: string,
): Promise<FeedbackChangeResult> {
  const item = await findFeedbackById(id);

  if (!item) {
    return "not_found";
  }

  await saveFeedbackReply(id, reply, new Date());
  await recordActivity({ userId: item.userId, actorId, type: "feedback_replied" });
  await notify(item.userId, "feedback_replied", { reply });
  return "ok";
}
