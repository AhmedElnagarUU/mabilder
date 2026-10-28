import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { connectToDatabase } from "@/shared/db/mongoose";

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
