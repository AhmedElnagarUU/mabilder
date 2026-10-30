import { randomUUID } from "node:crypto";
import { requireAccess } from "../billing/require-access";
import { getSite } from "../site-creation/service";
import { createUploadUrl, readS3Config, type UploadUrlSigner } from "./s3";
import type { UploadContentType, UploadGrant, UploadRequest, UploadSlotId } from "./types";
export type UploadResult =
  | ({ ok: true } & UploadGrant)
  | { ok: false; code: "site_not_found" | "uploads_unavailable" };

const extensionByContentType: Record<UploadContentType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function buildUploadKey(
  ownerPath: string,
  slotId: UploadSlotId,
  contentType: UploadContentType,
): string {
  return `${ownerPath}/${slotId}/${randomUUID()}.${extensionByContentType[contentType]}`;
}

export function buildPublicUrl(publicBaseUrl: string, key: string): string {
  return `${publicBaseUrl.replace(/\/+$/, "")}/${key}`;
}

export async function createUploadGrant(
  request: UploadRequest,
  publicBaseUrl: string,
  signUrl: UploadUrlSigner = createUploadUrl,
  userId = "",
): Promise<UploadGrant> {
  const ownerPath = request.slotId === "payments" ? `users/${userId}` : `sites/${request.siteId}`;
  const key = buildUploadKey(ownerPath, request.slotId, request.contentType);

  return {
    uploadUrl: await signUrl(key, request.contentType, request.size),
    publicUrl: buildPublicUrl(publicBaseUrl, key),
  };
}

async function checkSiteAccess(ownerId: string, siteId: string | undefined): Promise<boolean> {
  if (!siteId || !(await getSite(ownerId, siteId))) {
    return false;
  }

  await requireAccess(ownerId);
  return true;
}

export async function requestUpload(ownerId: string, request: UploadRequest): Promise<UploadResult> {
  if (request.slotId !== "payments" && !(await checkSiteAccess(ownerId, request.siteId))) {
    return { ok: false, code: "site_not_found" };
  }

  const config = readS3Config();

  if (!config) {
    return { ok: false, code: "uploads_unavailable" };
  }

  const grant = await createUploadGrant(request, config.publicBaseUrl, createUploadUrl, ownerId);
  return { ok: true, ...grant };
}
