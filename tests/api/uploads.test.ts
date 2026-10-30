import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { deleteAllSites, request, signUp } from "./client";

const brief = {
  businessName: "U1 Uploads Studio",
  industry: "Interior design",
  description: "A small interior design studio.",
};

let cookie = "";
let otherCookie = "";
let siteId = "";

function postUpload(body: unknown, withCookie = cookie): Promise<Response> {
  return request("/api/uploads", { method: "POST", cookie: withCookie, body });
}

function validBody(): Record<string, unknown> {
  return { siteId, slotId: "projects", contentType: "image/png", size: 2048 };
}

before(async () => {
  cookie = await signUp("U1 Uploads Owner");
  otherCookie = await signUp("U1 Uploads Other");

  const created = await request("/api/sites", { method: "POST", cookie, body: brief });
  assert.equal(created.status, 201, await created.clone().text());
  siteId = ((await created.json()) as { site: { id: string } }).site.id;
});

after(async () => {
  await deleteAllSites(cookie);
  await deleteAllSites(otherCookie);
});

test("signed-out upload request returns 401", async () => {
  const response = await request("/api/uploads", { method: "POST", body: validBody() });
  assert.equal(response.status, 401);
});

test("another user's site returns 404", async () => {
  assert.equal((await postUpload(validBody(), otherCookie)).status, 404);
});

test("invalid type, size, slot or body returns 400 invalid_request", async () => {
  const invalidBodies = [
    { ...validBody(), contentType: "image/gif" },
    { ...validBody(), size: 8 * 1024 * 1024 + 1 },
    { ...validBody(), slotId: "avatars" },
    { siteId },
  ];

  for (const body of invalidBodies) {
    const response = await postUpload(body);
    assert.equal(response.status, 400);
    assert.equal(((await response.json()) as { code: string }).code, "invalid_request");
  }
});

test("owner gets a presigned upload URL and the public URL for the key", async () => {
  const response = await postUpload(validBody());
  assert.equal(response.status, 200, await response.clone().text());

  const body = (await response.json()) as { uploadUrl: string; publicUrl: string };
  const key = new URL(body.publicUrl).pathname.slice(1);

  assert.match(key, new RegExp(`^sites/${siteId}/projects/[0-9a-f-]{36}\\.png$`));
  assert.ok(new URL(body.uploadUrl).pathname.endsWith(`/${key}`));
  assert.equal(new URL(body.uploadUrl).searchParams.get("X-Amz-Expires"), "300");
});
