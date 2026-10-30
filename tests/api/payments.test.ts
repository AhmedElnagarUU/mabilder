import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { ActivityEventModel } from "../../src/features/activity/model";
import { DAY_MS, addOneMonth } from "../../src/features/billing/plans";
import { PaymentModel } from "../../src/features/billing/payments/model";
import type { PaymentItem } from "../../src/features/billing/payments/types";
import type { WalletInfo } from "../../src/features/billing/settings/types";
import { getUserAccess } from "../../src/features/billing/user-access";
import { NotificationModel } from "../../src/features/notifications/model";
import { connectToDatabase, disconnectFromDatabase } from "../../src/shared/db/mongoose";
import { request, signUp } from "./client";

type TestUser = { id: string; cookie: string };

const adminEmail = process.env.ADMIN_EMAIL ?? "";
const adminPassword = process.env.ADMIN_PASSWORD ?? "";
const PAYMENTS = "/api/billing/payments";

let adminCookie = "";
let payer: TestUser;
let other: TestUser;

async function createUser(name: string): Promise<TestUser> {
  const cookie = await signUp(name);
  const response = await request("/api/auth/get-session", { cookie });
  const body = (await response.json()) as { user: { id: string } };
  return { id: body.user.id, cookie };
}

function submit(user: TestUser, overrides: Record<string, unknown> = {}): Promise<Response> {
  return request(PAYMENTS, {
    method: "POST",
    cookie: user.cookie,
    body: { method: "vodafone_cash", reference: "TX-1001", senderPhone: "01000000000", ...overrides },
  });
}

async function submitOk(user: TestUser): Promise<PaymentItem> {
  const response = await submit(user);
  assert.equal(response.status, 201, await response.clone().text());
  return ((await response.json()) as { payment: PaymentItem }).payment;
}

function review(paymentId: string, decision: "approve" | "reject", body: unknown = {}): Promise<Response> {
  return request(`/api/admin/payments/${paymentId}/${decision}`, {
    method: "POST",
    cookie: adminCookie,
    body,
  });
}

function changePlan(userId: string, body: unknown): Promise<Response> {
  return request(`/api/admin/users/${userId}/plan`, { method: "POST", cookie: adminCookie, body });
}

function countNotifications(userId: string, type: "payment_approved" | "payment_rejected" | "plan_changed"): Promise<number> {
  return NotificationModel.countDocuments({ userId, type });
}

before(async () => {
  assert.ok(process.env.MONGODB_DB_NAME?.endsWith("_test"), "not the test database");
  assert.ok(process.env.PRO_PRICE_EGP, "PRO_PRICE_EGP is set by the test runner");

  const login = await request("/api/admin/session", {
    method: "POST",
    body: { email: adminEmail, password: adminPassword },
  });
  assert.equal(login.status, 200);
  adminCookie = login.headers.getSetCookie()[0].split(";")[0];

  payer = await createUser("B2 Payer");
  other = await createUser("B2 Other");
  await connectToDatabase();
});

after(async () => {
  await disconnectFromDatabase();
});

test("a submitted payment is pending, logged, and a second one is refused while it waits", async () => {
  const payment = await submitOk(payer);

  assert.equal(payment.status, "pending");
  assert.equal(payment.currency, "EGP");
  assert.equal(payment.amount, Number(process.env.PRO_PRICE_EGP));
  assert.equal(payment.userId, payer.id);

  const event = await ActivityEventModel.findOne({ userId: payer.id, type: "payment_submitted" });
  assert.equal(event?.actorId, payer.id);

  const second = await submit(payer, { reference: "TX-1002" });
  assert.equal(second.status, 409);
  assert.equal(((await second.json()) as { code: string }).code, "payment_pending");
  assert.equal(await PaymentModel.countDocuments({ userId: payer.id }), 1);
});

test("invalid payments and anonymous requests are refused", async () => {
  assert.equal((await submit(other, { method: "bitcoin" })).status, 400);
  assert.equal((await submit(other, { senderPhone: undefined })).status, 400);
  assert.equal((await submit(other, { senderPhone: "12345" })).status, 400);
  assert.equal((await submit(other, { senderPhone: "02000000000" })).status, 400);
  assert.equal((await submit(other, { proofImageUrl: "https://evil.example.com/a.png" })).status, 400);
  assert.equal(await PaymentModel.countDocuments({ userId: other.id }), 0);

  assert.equal((await request(PAYMENTS)).status, 401);
  assert.equal((await request(PAYMENTS, { method: "POST", body: {} })).status, 401);
});

test("the phone may contain spaces or dashes, the reference is optional and a client amount is ignored", async () => {
  const user = await createUser("B2 Optional");
  const proofImageUrl = `https://uploads.test.local/users/${user.id}/payments/proof.png`;

  const response = await submit(user, {
    reference: undefined,
    senderPhone: "010 0000-0000",
    amount: 1,
    proofImageUrl,
  });
  assert.equal(response.status, 201, await response.clone().text());

  const stored = await PaymentModel.findOne({ userId: user.id });
  assert.equal(stored?.amount, Number(process.env.PRO_PRICE_EGP));
  assert.equal(stored?.senderPhone, "01000000000");
  assert.equal(stored?.reference, undefined);
  assert.equal(stored?.proofImageUrl, proofImageUrl);
});

test("approving gives Pro for one month, notifies and logs once; approving again changes nothing", async () => {
  const pending = (await PaymentModel.findOne({ userId: payer.id, status: "pending" }))?.id as string;
  const before = new Date();

  const approved = await review(pending, "approve");
  assert.equal(approved.status, 200);
  assert.equal(((await approved.json()) as { changed: boolean }).changed, true);

  const access = await getUserAccess(payer.id);
  assert.equal(access.state, "active");
  const expected = addOneMonth(before).getTime();
  assert.ok(Math.abs((access.renewsAt?.getTime() ?? 0) - expected) < 60_000);

  const event = await ActivityEventModel.findOne({ userId: payer.id, type: "payment_approved" });
  assert.equal(event?.actorId, "admin");
  assert.equal(await countNotifications(payer.id, "payment_approved"), 1);

  const again = await review(pending, "approve");
  assert.equal(again.status, 200);
  assert.equal(((await again.json()) as { changed: boolean }).changed, false);
  assert.equal((await getUserAccess(payer.id)).renewsAt?.getTime(), access.renewsAt?.getTime());
  assert.equal(await countNotifications(payer.id, "payment_approved"), 1);
  assert.equal(await ActivityEventModel.countDocuments({ userId: payer.id, type: "payment_approved" }), 1);

  const rejectApproved = await review(pending, "reject");
  assert.equal(rejectApproved.status, 409);
});

test("a second approved payment adds a month after the current paid end", async () => {
  const first = (await getUserAccess(payer.id)).renewsAt as Date;
  const payment = await submitOk(payer);

  assert.equal((await review(payment.id, "approve")).status, 200);

  const second = (await getUserAccess(payer.id)).renewsAt as Date;
  assert.equal(second.getTime(), addOneMonth(first).getTime());
});

test("rejecting notifies the user, logs it and leaves access unchanged", async () => {
  const payment = await submitOk(other);
  const rejected = await review(payment.id, "reject", { note: "Reference not found" });
  assert.equal(rejected.status, 200);

  assert.equal((await getUserAccess(other.id)).state, "trial");
  assert.equal(await countNotifications(other.id, "payment_rejected"), 1);

  const event = await ActivityEventModel.findOne({ userId: other.id, type: "payment_rejected" });
  assert.equal(event?.actorId, "admin");

  const stored = await PaymentModel.findById(payment.id);
  assert.equal(stored?.status, "rejected");
  assert.equal(stored?.note, "Reference not found");

  assert.equal((await review(payment.id, "approve")).status, 409);
  assert.equal((await getUserAccess(other.id)).state, "trial");

  const unknown = await review("0123456789abcdef01234567", "approve");
  assert.equal(unknown.status, 404);
});

test("a customer only sees their own payments, the admin sees all with the user", async () => {
  const own = await request(PAYMENTS, { cookie: other.cookie });
  const ownBody = (await own.json()) as { payments: PaymentItem[] };
  assert.ok(ownBody.payments.length >= 1);
  assert.ok(ownBody.payments.every((payment) => payment.userId === other.id));

  const stranger = await createUser("B2 Stranger");
  const empty = (await (await request(PAYMENTS, { cookie: stranger.cookie })).json()) as {
    payments: PaymentItem[];
  };
  assert.deepEqual(empty.payments, []);

  const list = await request("/api/admin/payments?status=rejected", { cookie: adminCookie });
  assert.equal(list.status, 200);
  const body = (await list.json()) as {
    items: { userId: string; userName: string; status: string }[];
    expectedPriceEgp: number;
  };
  assert.equal(body.expectedPriceEgp, Number(process.env.PRO_PRICE_EGP));
  assert.ok(body.items.every((item) => item.status === "rejected"));
  assert.ok(body.items.some((item) => item.userId === other.id && item.userName === "B2 Other"));
});

test("admin plan change: grant Pro, end the plan, extend the trial, each logged and notified", async () => {
  const user = await createUser("B2 Plan");
  const until = new Date(Date.now() + 20 * DAY_MS);

  const granted = await changePlan(user.id, { action: "grant_pro", until: until.toISOString() });
  assert.equal(granted.status, 200);

  const active = await getUserAccess(user.id);
  assert.equal(active.state, "active");
  assert.equal(active.renewsAt?.getTime(), until.getTime());

  const ended = await changePlan(user.id, { action: "end_plan" });
  assert.equal(ended.status, 200);
  assert.equal((await getUserAccess(user.id)).state, "expired");

  const extendTo = new Date(Date.now() + 40 * DAY_MS);
  const extended = await changePlan(user.id, { action: "extend_trial", until: extendTo.toISOString() });
  assert.equal(extended.status, 200);

  const trial = await getUserAccess(user.id);
  assert.equal(trial.state, "trial");
  assert.equal(trial.trialEndsAt?.getTime(), extendTo.getTime());

  const events = await ActivityEventModel.find({ userId: user.id, type: "plan_changed" });
  assert.equal(events.length, 3);
  assert.ok(events.every((event) => event.actorId === "admin"));
  assert.equal(await countNotifications(user.id, "plan_changed"), 3);
});

test("admin plan change refuses a past date, an unknown action and an unknown user", async () => {
  const user = await createUser("B2 Plan Invalid");
  const past = new Date(Date.now() - DAY_MS).toISOString();

  assert.equal((await changePlan(user.id, { action: "grant_pro", until: past })).status, 400);
  assert.equal((await changePlan(user.id, { action: "grant_pro" })).status, 400);
  assert.equal((await changePlan(user.id, { action: "delete_everything" })).status, 400);
  assert.equal((await changePlan("0123456789abcdef01234567", { action: "end_plan" })).status, 404);
  assert.equal(await ActivityEventModel.countDocuments({ userId: user.id, type: "plan_changed" }), 0);
});

test("without an admin session every admin payment, plan and settings route is refused", async () => {
  const customerCookie = payer.cookie;
  const targets: [string, string][] = [
    ["GET", "/api/admin/payments"],
    ["POST", "/api/admin/payments/0123456789abcdef01234567/approve"],
    ["POST", "/api/admin/payments/0123456789abcdef01234567/reject"],
    ["POST", `/api/admin/users/${payer.id}/plan`],
    ["GET", "/api/admin/settings/payment"],
    ["PUT", "/api/admin/settings/payment"],
  ];

  for (const [method, path] of targets) {
    const body = method === "GET" ? undefined : {};
    assert.equal((await request(path, { method, body })).status, 401, `${method} ${path}`);
    assert.equal(
      (await request(path, { method, body, cookie: customerCookie })).status,
      401,
      `${method} ${path} as a customer`,
    );
  }
});

test("payment settings saved by the admin reach the customer billing data in the user's language", async () => {
  const settings = {
    wallets: [
      { method: "vodafone_cash", number: "01012345678", name: "Owner" },
      { method: "other_wallet", number: "01198765432", name: "Backup" },
    ],
    instapayAddress: "owner@instapay",
    instructions: { en: "Send the exact amount.", ar: "Ø­ÙˆÙ‘Ù„ Ø§Ù„Ù…Ø¨Ù„Øº Ø¨Ø§Ù„Ø¶Ø¨Ø·." },
  };

  const saved = await request("/api/admin/settings/payment", { method: "PUT", cookie: adminCookie, body: settings });
  assert.equal(saved.status, 200);

  const read = await request("/api/admin/settings/payment", { cookie: adminCookie });
  assert.deepEqual(await read.json(), settings);

  const english = (await (await request(`${PAYMENTS}?locale=en`, { cookie: other.cookie })).json()) as {
    wallet: WalletInfo;
  };
  assert.equal(english.wallet.priceEgp, Number(process.env.PRO_PRICE_EGP));
  assert.deepEqual(english.wallet.wallets, settings.wallets);
  assert.equal(english.wallet.instapayAddress, "owner@instapay");
  assert.equal(english.wallet.instructions, settings.instructions.en);

  const arabic = (await (await request(`${PAYMENTS}?locale=ar`, { cookie: other.cookie })).json()) as {
    wallet: WalletInfo;
  };
  assert.equal(arabic.wallet.instructions, settings.instructions.ar);

  const page = await request("/ar/billing", { cookie: other.cookie });
  assert.equal(page.status, 200);
  assert.ok((await page.text()).includes("owner@instapay"));
});

test("invalid payment settings are refused and change nothing", async () => {
  const before = await (await request("/api/admin/settings/payment", { cookie: adminCookie })).json();

  const invalid = await request("/api/admin/settings/payment", {
    method: "PUT",
    cookie: adminCookie,
    body: { wallets: [{ method: "bitcoin", number: "1" }], instapayAddress: "", instructions: { en: "", ar: "" } },
  });
  assert.equal(invalid.status, 400);

  const after = await (await request("/api/admin/settings/payment", { cookie: adminCookie })).json();
  assert.deepEqual(after, before);
});
