import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { recordActivity } from "@/features/activity/service";
import type { ActivityType } from "@/features/activity/types";
import { notify } from "@/features/notifications/service";
import { connectToDatabase } from "@/shared/db/mongoose";
import { ACCOUNT_INACTIVE_CODE, isEmailInactive } from "./inactive";

const authActivityTypes: Record<string, ActivityType> = {
  "/sign-up/email": "signed_up",
  "/sign-in/email": "signed_in",
};

// newSession exists only when the request created a session, so failed sign-ins are not recorded.
async function recordAuthActivity(ctx: {
  path: string;
  context: { newSession?: { user: { id: string; name: string } } | null };
}): Promise<void> {
  const type = authActivityTypes[ctx.path];
  const user = ctx.context.newSession?.user;

  if (!type || !user) {
    return;
  }

  await recordActivity({ userId: user.id, actorId: user.id, type });

  if (type === "signed_up") {
    await notify(user.id, "welcome", { name: user.name });
  }
}

async function refuseInactiveSignIn(ctx: {
  path: string;
  body?: { email?: unknown };
}): Promise<void> {
  const email = ctx.body?.email;

  if (ctx.path !== "/sign-in/email" || typeof email !== "string") {
    return;
  }

  if (await isEmailInactive(email)) {
    throw new APIError("FORBIDDEN", {
      message: "This account is deactivated.",
      code: ACCOUNT_INACTIVE_CODE,
    });
  }
}

async function createAuth() {
  const mongoose = await connectToDatabase();
  const db = mongoose.connection.db;

  if (!db) {
    throw new Error("The database connection has no db handle.");
  }

  return betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    database: mongodbAdapter(db),
    emailAndPassword: { enabled: true },
    user: {
      additionalFields: {
        inactive: { type: "boolean", required: false, defaultValue: false, input: false },
      },
    },
    hooks: {
      before: createAuthMiddleware(refuseInactiveSignIn),
      after: createAuthMiddleware(recordAuthActivity),
    },
  });
}

export type Auth = Awaited<ReturnType<typeof createAuth>>;

let authPromise: Promise<Auth> | null = null;

export function getAuth(): Promise<Auth> {
  if (!authPromise) {
    authPromise = createAuth().catch((error: unknown) => {
      authPromise = null;
      throw error;
    });
  }

  return authPromise;
}
