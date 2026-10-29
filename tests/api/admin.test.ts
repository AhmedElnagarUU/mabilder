import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { ActivityEventModel } from "../../src/features/activity/model";
import { signAdminSession } from "../../src/features/admin/auth/token";
import { getOverview } from "../../src/features/admin/service";
import type { UserDetail, UserListPage } from "../../src/features/admin/types";
import { SiteModel } from "../../src/features/site-creation/model";
import { connectToDatabase, disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { request, signUp } from "./client";

const DAY_MS = 24 * 60 * 60 * 1000;
const PASSWORD = "q1-test-password";
const adminEmail = process.env.ADMIN_EMAIL ?? "";
const adminPassword = process.env.ADMIN_PASSWORD ?? "";
const sessionSecret = process.env.ADMIN_SESSION_SECRET ?? "";

type Customer = { cookie: string; id: string; email: string };

let adminCookie = "";
let customer: Customer;
const seededUserIds: string[] = [];
const seededSiteOwnerIds: string[] = [];

async function loginAs(email: string, password: string): Promise<Response> {
  return request("/api/admin/session", { method: "POST", body: { email, password } });
}

function cookiePair(response: Response): string {
  return response.headers.getSetCookie()[0].split(";")[0];
}

async function createCustomer(name: string): Promise<Customer> {
  const cookie = await signUp(name);
  const response = await request("/api/auth/get-session", { cookie });
  const { user } = (await response.json()) as { user: { id: string; email: string } };
  return { cookie, id: user.id, email: user.email };
}

async function signInCustomer(email: string): Promise<Response> {
  return request("/api/auth/sign-in/email", { method: "POST", body: { email, password: PASSWORD } });
}

async function seedUsers(users: Record<string, unknown>[]): Promise<string[]> {
  const mongo = await connectToDatabase();
  const docs = users.map((user, index) => ({
    email: `seed-${randomUUID()}-${index}@test.local`,
    emailVerified: false,
    ...user,
  }));
  const result = await mongo.connection.collection("user").insertMany(docs);
  const ids = Object.values(result.insertedIds).map((id) => id.toString());
  seededUserIds.push(...ids);
  return ids;
}

async function seedSite(ownerId: string, status: "ready" | "error"): Promise<void> {
  await SiteModel.create({
    ownerId,
    slug: `seed-${randomUUID()}`,
    brief: { businessName: "Seed", industry: "Seed", description: "Seed" },
    status,
  });
  seededSiteOwnerIds.push(ownerId);
}

async function getJson<T>(path: string, cookie: string): Promise<T> {
  const response = await request(path, { cookie });
  assert.equal(response.status, 200, await response.clone().text());
  return (await response.json()) as T;
}

before(async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");
  assert.ok(adminEmail && adminPassword && sessionSecret, "admin test env is missing");

  const login = await loginAs(adminEmail, adminPassword);
  assert.equal(login.status, 200);
  adminCookie = cookiePair(login);

  customer = await createCustomer("X3 Customer");
  await connectToDatabase();
});

after(async () => {
  await removeSeeds();
  await disconnectFromDatabase();
});

test("without an admin cookie, admin pages redirect to the login and admin APIs return 401", async () => {
  const page = await request("/en/admin");
  assert.ok(page.status === 307 || page.status === 308);
  assert.ok(page.headers.get("location")?.endsWith("/en/admin/login"));

  const users = await request("/api/admin/users");
  assert.equal(users.status, 401);

  const detail = await request(`/api/admin/users/${customer.id}`);
  assert.equal(detail.status, 401);

  const deactivate = await request(`/api/admin/users/${customer.id}/deactivate`, { method: "POST" });
  assert.equal(deactivate.status, 401);
});

test("the login page renders without a session", async () => {
  const page = await request("/en/admin/login");
  assert.equal(page.status, 200);
  assert.ok((await page.text()).includes("Admin sign-in"));
});

test("a wrong password or email is refused, the right login sets a safe cookie", async () => {
  const wrongPassword = await loginAs(adminEmail, "not-the-password");
  assert.equal(wrongPassword.status, 401);
  assert.equal(wrongPassword.headers.getSetCookie().length, 0);

  const wrongEmail = await loginAs("someone@test.local", adminPassword);
  assert.equal(wrongEmail.status, 401);

  const login = await loginAs(adminEmail, adminPassword);
  assert.equal(login.status, 200);

  const setCookie = login.headers.getSetCookie()[0];
  assert.ok(setCookie.startsWith("admin_session="));
  assert.ok(setCookie.includes("HttpOnly"));
  assert.ok(setCookie.includes("SameSite=Lax"));
  assert.ok(setCookie.includes("Path=/"));
  assert.ok(setCookie.includes(`Max-Age=${5 * 60 * 60}`));
});

test("with the admin cookie, admin pages and APIs work", async () => {
  const users = await request("/api/admin/users", { cookie: adminCookie });
  assert.equal(users.status, 200);

  for (const path of ["/en/admin", "/en/admin/users", `/en/admin/users/${customer.id}`]) {
    const page = await request(path, { cookie: adminCookie });
    assert.equal(page.status, 200, path);
  }
});

test("a cookie with a tampered signature or a past expiry gets 401", async () => {
  const valid = signAdminSession(sessionSecret, Date.now() + DAY_MS);
  const tampered = `${valid.slice(0, -1)}${valid.endsWith("0") ? "1" : "0"}`;
  const forgedExpiry = `${Date.now() + 10 * DAY_MS}.${valid.split(".")[1]}`;
  const expired = signAdminSession(sessionSecret, Date.now() - 1000);
  const wrongSecret = signAdminSession("another-secret-0123456789", Date.now() + DAY_MS);

  assert.equal((await request("/api/admin/users", { cookie: `admin_session=${valid}` })).status, 200);

  for (const token of [tampered, forgedExpiry, expired, wrongSecret, "garbage", ""]) {
    const response = await request("/api/admin/users", { cookie: `admin_session=${token}` });
    assert.equal(response.status, 401, token);
  }

  const page = await request("/en/admin", { cookie: `admin_session=${expired}` });
  assert.ok(page.headers.get("location")?.endsWith("/en/admin/login"));
});

test("a customer session gives no admin access", async () => {
  assert.equal((await request("/api/admin/users", { cookie: customer.cookie })).status, 401);
  assert.equal((await request(`/api/admin/users/${customer.id}`, { cookie: customer.cookie })).status, 401);

  const page = await request("/en/admin", { cookie: customer.cookie });
  assert.ok(page.headers.get("location")?.endsWith("/en/admin/login"));
});

test("logout clears the admin cookie", async () => {
  const response = await request("/api/admin/session", { method: "DELETE", cookie: adminCookie });
  assert.equal(response.status, 200);
  assert.ok(response.headers.getSetCookie()[0].includes("Max-Age=0"));
});

test("deactivate signs the user out, refuses sign-in and is logged; activate restores", async () => {
  const user = await createCustomer("X3 Deactivate");
  assert.equal((await request("/api/sites", { cookie: user.cookie })).status, 200);

  const deactivated = await request(`/api/admin/users/${user.id}/deactivate`, {
    method: "POST",
    cookie: adminCookie,
  });
  assert.equal(deactivated.status, 200);

  assert.equal((await request("/api/sites", { cookie: user.cookie })).status, 401);

  const refused = await signInCustomer(user.email);
  assert.equal(refused.status, 403);
  assert.equal(((await refused.json()) as { code: string }).code, "account_inactive");

  const event = await ActivityEventModel.findOne({ userId: user.id, type: "account_deactivated" });
  assert.equal(event?.actorId, "admin");

  const detail = await getJson<UserDetail>(`/api/admin/users/${user.id}`, adminCookie);
  assert.equal(detail.user.inactive, true);
  assert.ok(detail.activity.some((item) => item.type === "account_deactivated"));

  const activated = await request(`/api/admin/users/${user.id}/activate`, {
    method: "POST",
    cookie: adminCookie,
  });
  assert.equal(activated.status, 200);

  const signedIn = await signInCustomer(user.email);
  assert.equal(signedIn.status, 200);
  const newCookie = signedIn.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
  assert.equal((await request("/api/sites", { cookie: newCookie })).status, 200);

  const activatedEvent = await ActivityEventModel.findOne({ userId: user.id, type: "account_activated" });
  assert.equal(activatedEvent?.actorId, "admin");
});

test("a session that still exists for an inactive user gets 403 account_inactive on site APIs", async () => {
  const user = await createCustomer("X3 Inactive Session");
  const mongo = await connectToDatabase();
  const filter = { _id: new mongo.Types.ObjectId(user.id) };
  await mongo.connection.collection("user").updateOne(filter, { $set: { inactive: true } });

  const sites = await request("/api/sites", { cookie: user.cookie });
  assert.equal(sites.status, 403);
  assert.equal(((await sites.json()) as { code: string }).code, "account_inactive");

  const page = await request("/en/dashboard", { cookie: user.cookie });
  assert.ok(page.headers.get("location")?.includes("/en/sign-in"));

  await mongo.connection.collection("user").updateOne(filter, { $set: { inactive: false } });
  assert.equal((await request("/api/sites", { cookie: user.cookie })).status, 200);
});

test("the admin routes answer 404 for unknown users and a missing preview", async () => {
  const missingId = "0123456789abcdef01234567";

  assert.equal((await request(`/api/admin/users/${missingId}`, { cookie: adminCookie })).status, 404);
  assert.equal((await request("/api/admin/users/not-an-id", { cookie: adminCookie })).status, 404);
  assert.equal(
    (await request(`/api/admin/users/${missingId}/deactivate`, { method: "POST", cookie: adminCookie })).status,
    404,
  );
  assert.equal(
    (await request(`/api/admin/users/${customer.id}/preview/index.html`, { cookie: adminCookie })).status,
    404,
  );
  assert.equal((await request(`/api/admin/users/${customer.id}/preview/index.html`)).status, 401);
});

// newFeedback and the payment / plan counts are left out: feedback.test.ts and payments.test.ts write in parallel.
type OverviewDelta = Omit<
  Awaited<ReturnType<typeof getOverview>>,
  "newFeedback" | "pendingPayments" | "trialUsers" | "proUsers" | "expiredUsers"
>;

// Real users are created "now"; moving the clock 400 days ahead keeps them out of every time window.
async function seedAndMeasure(): Promise<OverviewDelta> {
  const now = new Date(Date.now() + 400 * DAY_MS);
  const ago = (ms: number) => new Date(now.getTime() - ms);
  const hours = (count: number) => count * 60 * 60 * 1000;

  const before = await getOverview(now);

  const [recent, weekly, dormant] = await seedUsers([
    { name: "Seed recent", createdAt: ago(DAY_MS), lastActiveAt: ago(hours(2)) },
    { name: "Seed weekly", createdAt: ago(20 * DAY_MS), lastActiveAt: ago(3 * DAY_MS) },
    { name: "Seed dormant", createdAt: ago(100 * DAY_MS), lastActiveAt: ago(20 * DAY_MS), inactive: true },
  ]);
  await seedUsers([{ name: "Seed never active", createdAt: ago(100 * DAY_MS) }]);
  await seedSite(recent, "ready");
  await seedSite(weekly, "ready");
  await seedSite(dormant, "error");

  const after = await getOverview(now);

  return {
    totalUsers: after.totalUsers - before.totalUsers,
    activeToday: after.activeToday - before.activeToday,
    active7Days: after.active7Days - before.active7Days,
    active30Days: after.active30Days - before.active30Days,
    newSignUps7Days: after.newSignUps7Days - before.newSignUps7Days,
    inactiveUsers: after.inactiveUsers - before.inactiveUsers,
    sitesReady: after.sitesReady - before.sitesReady,
    sitesError: after.sitesError - before.sitesError,
  };
}

async function removeSeeds(): Promise<void> {
  const mongo = await connectToDatabase();
  const ids = seededUserIds.splice(0).map((id) => new mongo.Types.ObjectId(id));
  await mongo.connection.collection("user").deleteMany({ _id: { $in: ids } });
  await SiteModel.deleteMany({ ownerId: { $in: seededSiteOwnerIds.splice(0) } });
}

test("overview counts match a small seeded set", async () => {
  const expected: OverviewDelta = {
    totalUsers: 4,
    activeToday: 1,
    active7Days: 2,
    active30Days: 3,
    newSignUps7Days: 1,
    inactiveUsers: 1,
    sitesReady: 2,
    sitesError: 1,
  };

  // Other test files run in parallel and create users and sites, so a mismatch is measured again.
  let delta = await seedAndMeasure();

  for (let attempt = 1; attempt < 3 && JSON.stringify(delta) !== JSON.stringify(expected); attempt += 1) {
    await removeSeeds();
    delta = await seedAndMeasure();
  }

  assert.deepEqual(delta, expected);
});
test("the user list searches, filters, sorts and pages by 25", async () => {
  const token = `seedlist${randomUUID().slice(0, 8)}`;
  const base = Date.now();
  const names = Array.from({ length: 27 }, (_, index) => `${token} user ${String(index).padStart(2, "0")}`);

  await seedUsers(
    names.map((name, index) => ({
      name,
      createdAt: new Date(base - index * 1000),
      lastActiveAt: new Date(base - (27 - index) * 1000),
      inactive: index === 0,
    })),
  );

  const query = (params: string) =>
    getJson<UserListPage>(`/api/admin/users?search=${token}&${params}`, adminCookie);

  const first = await query("sort=joined");
  assert.equal(first.total, 27);
  assert.equal(first.pageSize, 25);
  assert.equal(first.pageCount, 2);
  assert.equal(first.items.length, 25);
  assert.equal(first.items[0].name, names[0]);

  const second = await query("sort=joined&page=2");
  assert.equal(second.items.length, 2);

  const byLastActive = await query("sort=lastActive");
  assert.equal(byLastActive.items[0].name, names[26]);

  const inactiveOnly = await query("status=inactive");
  assert.deepEqual(inactiveOnly.items.map((item) => item.name), [names[0]]);

  const activeOnly = await query("status=active");
  assert.equal(activeOnly.total, 26);

  const byEmail = await getJson<UserListPage>(
    `/api/admin/users?search=${encodeURIComponent(customer.email)}`,
    adminCookie,
  );
  assert.deepEqual(byEmail.items.map((item) => item.id), [customer.id]);
});
