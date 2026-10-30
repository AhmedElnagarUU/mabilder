import assert from "node:assert/strict";
import { test } from "node:test";
import { createUploadUrl } from "../../src/features/uploads/s3";
import { buildPublicUrl, createUploadGrant } from "../../src/features/uploads/service";
import { MAX_UPLOAD_BYTES, uploadRequestSchema } from "../../src/features/uploads/types";

const validRequest = { siteId: "site-1", slotId: "projects", contentType: "image/png", size: 1024 };
const uuid = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

test("U1: only jpeg, png and webp are accepted", () => {
  assert.ok(uploadRequestSchema.safeParse(validRequest).success);
  assert.ok(uploadRequestSchema.safeParse({ ...validRequest, contentType: "image/webp" }).success);
  assert.ok(!uploadRequestSchema.safeParse({ ...validRequest, contentType: "image/gif" }).success);
  assert.ok(!uploadRequestSchema.safeParse({ ...validRequest, contentType: "text/html" }).success);
});

test("U1: sizes outside 1 byte to 8 MB are rejected", () => {
  assert.ok(uploadRequestSchema.safeParse({ ...validRequest, size: MAX_UPLOAD_BYTES }).success);
  assert.ok(!uploadRequestSchema.safeParse({ ...validRequest, size: MAX_UPLOAD_BYTES + 1 }).success);
  assert.ok(!uploadRequestSchema.safeParse({ ...validRequest, size: 0 }).success);
});

test("U1: only the fixed slots are accepted", () => {
  assert.ok(uploadRequestSchema.safeParse({ ...validRequest, slotId: "editor" }).success);
  assert.ok(!uploadRequestSchema.safeParse({ ...validRequest, slotId: "../other" }).success);
});

test("CODE_RULES §7: key is sites/{siteId}/{slotId}/{uuid}.{ext} and the public URL is base + key", async () => {
  const signed: string[] = [];
  const grant = await createUploadGrant(
    uploadRequestSchema.parse({ ...validRequest, contentType: "image/jpeg" }),
    "https://cdn.example.com/",
    async (key, contentType, size) => {
      signed.push(`${key}|${contentType}|${size}`);
      return "https://signed.example.com/put";
    },
  );

  const publicUrlPattern = new RegExp(`^https://cdn\\.example\\.com/sites/site-1/projects/${uuid}\\.jpg$`);
  assert.match(grant.publicUrl, publicUrlPattern);
  assert.equal(grant.uploadUrl, "https://signed.example.com/put");
  assert.equal(signed.length, 1);
  assert.equal(signed[0], `${grant.publicUrl.replace("https://cdn.example.com/", "")}|image/jpeg|1024`);
  assert.equal(buildPublicUrl("https://cdn.example.com", "sites/a/b.png"), "https://cdn.example.com/sites/a/b.png");
});

test("U1: the presigned URL expires in 5 minutes and signs the content type and size", async () => {
  Object.assign(process.env, {
    S3_REGION: "us-east-1",
    S3_BUCKET: "fake-bucket",
    S3_ACCESS_KEY_ID: "AKIAFAKEFAKEFAKEFAKE",
    S3_SECRET_ACCESS_KEY: "fake-secret-fake-secret-fake-secret-0000",
    S3_PUBLIC_BASE_URL: "https://cdn.example.com",
  });

  const url = new URL(await createUploadUrl("sites/site-1/editor/a.png", "image/png", 1024));
  const signedHeaders = (url.searchParams.get("X-Amz-SignedHeaders") ?? "").split(";");

  assert.equal(url.searchParams.get("X-Amz-Expires"), "300");
  assert.ok(signedHeaders.includes("content-type"), "content-type is not signed");
  assert.ok(signedHeaders.includes("content-length"), "content-length is not signed");
  assert.ok(url.pathname.endsWith("/sites/site-1/editor/a.png"));
});
