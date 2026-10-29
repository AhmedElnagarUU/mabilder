import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";

type RequestOptions = {
  method?: string;
  cookie?: string;
  body?: unknown;
};

function getBaseUrl(): string {
  const baseUrl = process.env.API_BASE_URL;

  if (!baseUrl) {
    throw new Error("API_BASE_URL is not set. Run the API tests with npm run test:api.");
  }

  return baseUrl;
}

function send(path: string, options: RequestOptions): Promise<Response> {
  const baseUrl = getBaseUrl();
  const headers: Record<string, string> = { origin: baseUrl };

  if (options.cookie) {
    headers.cookie = options.cookie;
  }

  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  return fetch(`${baseUrl}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    redirect: "manual",
  });
}

// Generate calls the AI, and tests never call the AI.
export function request(path: string, options: RequestOptions = {}): Promise<Response> {
  if (path.endsWith("/generate")) {
    throw new Error("API tests must never call the generate route.");
  }

  return send(path, options);
}

export async function signUp(name: string): Promise<string> {
  const response = await request("/api/auth/sign-up/email", {
    method: "POST",
    body: { name, email: `q1-${randomUUID()}@test.local`, password: "q1-test-password" },
  });

  assert.equal(response.status, 200, await response.text());

  const cookie = response.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");

  assert.ok(cookie, "sign-up returned no session cookie");
  return cookie;
}

export async function deleteAllSites(cookie: string): Promise<void> {
  const response = await request("/api/sites", { cookie });
  const { sites } = (await response.json()) as { sites: { id: string }[] };

  for (const site of sites) {
    await request(`/api/sites/${site.id}`, { method: "DELETE", cookie });
  }
}
