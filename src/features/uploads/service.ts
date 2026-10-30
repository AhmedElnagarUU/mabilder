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
  siteId: string,
  slotId: UploadSlotId,
  contentType: UploadContentType,
): string {
  return `sites/${siteId}/${slotId}/${randomUUID()}.${extensionByContentType[contentType]}`;
}

export function buildPublicUrl(publicBaseUrl: string, key: string): string {
  return `${publicBaseUrl.replace(/\/+$/, "")}/${key}`;
}

export async function createUploadGrant(
  request: UploadRequest,
  publicBaseUrl: string,
  signUrl: UploadUrlSigner = createUploadUrl,
): Promise<UploadGrant> {
  const key = buildUploadKey(request.siteId, request.slotId, request.contentType);

  return {
    uploadUrl: await signUrl(key, request.contentType, request.size),
    publicUrl: buildPublicUrl(publicBaseUrl, key),
  };
}

export async function requestUpload(
  ownerId: string,
  siteId: string,
  slotId: UploadSlotId,
  contentType: UploadContentType,
  size: number,
): Promise<UploadResult> {
  if (!(await getSite(ownerId, siteId))) {
    return { ok: false, code: "site_not_found" };
  }

  await requireAccess(ownerId);

  const config = readS3Config();

  if (!config) {
    return { ok: false, code: "uploads_unavailable" };
  }

  const grant = await createUploadGrant({ siteId, slotId, contentType, size }, config.publicBaseUrl);
  return { ok: true, ...grant };
}
