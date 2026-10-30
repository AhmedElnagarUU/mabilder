import { z } from "zod";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const uploadContentTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const uploadSlotIds = ["projects", "editor"] as const;

export type UploadContentType = (typeof uploadContentTypes)[number];
export type UploadSlotId = (typeof uploadSlotIds)[number];

export const uploadRequestSchema = z.object({
  siteId: z.string().min(1),
  slotId: z.enum(uploadSlotIds),
  contentType: z.enum(uploadContentTypes),
  size: z.number().int().min(1).max(MAX_UPLOAD_BYTES),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;

export type UploadGrant = {
  uploadUrl: string;
  publicUrl: string;
};
