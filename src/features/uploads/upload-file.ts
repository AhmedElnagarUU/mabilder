import {
  MAX_UPLOAD_BYTES,
  uploadContentTypes,
  type UploadContentType,
  type UploadGrant,
  type UploadSlotId,
} from "./types";

export type UploadFailure =
  | "invalid_type"
  | "too_large"
  | "uploads_unavailable"
  | "subscription_required"
  | "generic";

export type UploadOutcome = { publicUrl: string } | { failure: UploadFailure };

function isUploadContentType(type: string): type is UploadContentType {
  return (uploadContentTypes as readonly string[]).includes(type);
}

export function checkFile(file: File): UploadFailure | null {
  if (!isUploadContentType(file.type)) {
    return "invalid_type";
  }

  return file.size < 1 || file.size > MAX_UPLOAD_BYTES ? "too_large" : null;
}

function failureOfStatus(status: number): UploadFailure {
  if (status === 503) {
    return "uploads_unavailable";
  }

  return status === 402 ? "subscription_required" : "generic";
}

async function requestGrant(
  siteId: string,
  slotId: UploadSlotId,
  file: File,
): Promise<UploadGrant | UploadFailure> {
  try {
    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId, slotId, contentType: file.type, size: file.size }),
    });

    return response.ok ? ((await response.json()) as UploadGrant) : failureOfStatus(response.status);
  } catch {
    return "generic";
  }
}

// XMLHttpRequest is used because fetch cannot report upload progress.
function putFile(uploadUrl: string, file: File, onProgress: (percent: number) => void): Promise<boolean> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => resolve(xhr.status >= 200 && xhr.status < 300);
    xhr.onerror = () => resolve(false);
    xhr.send(file);
  });
}

export async function uploadImage(
  siteId: string,
  slotId: UploadSlotId,
  file: File,
  onProgress: (percent: number) => void,
): Promise<UploadOutcome> {
  const invalid = checkFile(file);

  if (invalid) {
    return { failure: invalid };
  }

  const grant = await requestGrant(siteId, slotId, file);

  if (typeof grant === "string") {
    return { failure: grant };
  }

  return (await putFile(grant.uploadUrl, file, onProgress))
    ? { publicUrl: grant.publicUrl }
    : { failure: "generic" };
}
