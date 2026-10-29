import { spawn, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { connectToDatabase, disconnectFromDatabase } from "../src/shared/db/mongoose";

const port = 3100;
const baseUrl = `http://localhost:${port}`;
const startTimeoutMs = 60_000;
const testFiles = ".generator-build/tests/api/*.test.js";

function getTestDatabaseName(): string {
  const name = process.env.MONGODB_DB_NAME;

  if (!name) {
    throw new Error("MONGODB_DB_NAME is not set.");
  }

  return `${name}_test`;
}

async function dropTestDatabase(name: string): Promise<void> {
  const mongoose = await connectToDatabase();

  try {
    if (!name.endsWith("_test") || mongoose.connection.name !== name) {
      throw new Error(`Refusing to drop "${mongoose.connection.name}": not the test database.`);
    }

    await mongoose.connection.dropDatabase();
  } finally {
    await disconnectFromDatabase();
  }
}

async function isServerAnswering(): Promise<boolean> {
  try {
    await fetch(`${baseUrl}/api/sites`);
    return true;
  } catch {
    return false;
  }
}

// OPENROUTER_API_KEY is empty so any AI call fails fast instead of costing money.
function startServer(databaseName: string): ChildProcess {
  return spawn(
    process.execPath,
    [require.resolve("next/dist/bin/next"), "start", "-p", String(port)],
    {
      env: {
        ...process.env,
        MONGODB_DB_NAME: databaseName,
        BETTER_AUTH_URL: baseUrl,
        OPENROUTER_API_KEY: "",
      },
      stdio: ["ignore", "inherit", "inherit"],
    },
  );
}

async function waitForServer(server: ChildProcess): Promise<void> {
  const deadline = Date.now() + startTimeoutMs;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`next start exited with code ${server.exitCode}.`);
    }

    if (await isServerAnswering()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`next start did not answer on port ${port} within ${startTimeoutMs} ms.`);
}

function runTests(): Promise<number> {
  const tests = spawn(process.execPath, ["--test", testFiles], {
    env: { ...process.env, API_BASE_URL: baseUrl },
    stdio: "inherit",
  });

  return new Promise((resolve) => tests.on("exit", (code) => resolve(code ?? 1)));
}

function stopServer(server: ChildProcess): Promise<void> {
  if (server.exitCode !== null) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    server.on("exit", () => resolve());
    server.kill();
  });
}

async function main(): Promise<void> {
  if (!existsSync(".next/BUILD_ID")) {
    throw new Error("No production build found. Run npm run build first.");
  }

  if (await isServerAnswering()) {
    throw new Error(`Port ${port} is already in use. Stop that server first.`);
  }

  const databaseName = getTestDatabaseName();
  process.env.MONGODB_DB_NAME = databaseName;

  await dropTestDatabase(databaseName);

  const server = startServer(databaseName);

  try {
    await waitForServer(server);
    process.exitCode = await runTests();
  } finally {
    await stopServer(server);
    await dropTestDatabase(databaseName);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
