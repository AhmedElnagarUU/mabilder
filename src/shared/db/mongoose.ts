import mongoose from "mongoose";

const CONNECT_TIMEOUT_MS = 10_000;

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache =
  globalForMongoose.mongooseCache ?? {
    connection: null,
    promise: null,
  };

globalForMongoose.mongooseCache = cache;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cache.connection) {
    return cache.connection;
  }

  if (!cache.promise) {
    const url = process.env.MONGODB_URL;

    if (!url) {
      throw new Error("MONGODB_URL is not set.");
    }

    cache.promise = mongoose.connect(url, {
      dbName: process.env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
      connectTimeoutMS: CONNECT_TIMEOUT_MS,
    });
  }

  try {
    cache.connection = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }

  return cache.connection;
}

export async function disconnectFromDatabase(): Promise<void> {
  if (!cache.connection) {
    return;
  }

  await cache.connection.disconnect();
  cache.connection = null;
  cache.promise = null;
}
