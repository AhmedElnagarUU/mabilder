import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { createAuthMiddleware } from "better-auth/api";
import { recordActivity } from "@/features/activity/service";
import type { ActivityType } from "@/features/activity/types";
import { connectToDatabase } from "@/shared/db/mongoose";

const authActivityTypes: Record<string, ActivityType> = {
  "/sign-up/email": "signed_up",
  "/sign-in/email": "signed_in",
};

// newSession exists only when the request created a session, so failed sign-ins are not recorded.
async function recordAuthActivity(ctx: {
  path: string;
  context: { newSession?: { user: { id: string } } | null };
}): Promise<void> {
  const type = authActivityTypes[ctx.path];
  const userId = ctx.context.newSession?.user.id;

  if (type && userId) {
    await recordActivity({ userId, actorId: userId, type });
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
    hooks: { after: createAuthMiddleware(recordAuthActivity) },
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
