import { z } from "zod";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const uploadContentTypes = ["image/jpeg", "image/png", "image/webp"] as const;
export const uploadSlotIds = ["projects", "editor", "payments"] as const;

export type UploadContentType = (typeof uploadContentTypes)[number];
export type UploadSlotId = (typeof uploadSlotIds)[number];

// Payment screenshots belong to the user, not to a site, so only the other slots need a siteId.
export const uploadRequestSchema = z
  .object({
    siteId: z.string().min(1).optional(),
    slotId: z.enum(uploadSlotIds),
    contentType: z.enum(uploadContentTypes),
    size: z.number().int().min(1).max(MAX_UPLOAD_BYTES),
  })
  .refine((request) => request.slotId === "payments" || request.siteId !== undefined);

export type UploadRequest = z.infer<typeof uploadRequestSchema>;

export type UploadGrant = {
  uploadUrl: string;
  publicUrl: string;
};
