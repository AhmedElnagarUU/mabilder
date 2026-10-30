import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const UPLOAD_URL_EXPIRES_SECONDS = 5 * 60;

export type S3Config = {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl: string;
};

export type UploadUrlSigner = (key: string, contentType: string, size: number) => Promise<string>;

export function readS3Config(): S3Config | null {
  const region = process.env.S3_REGION;
  const bucket = process.env.S3_BUCKET;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

  if (!region || !bucket || !accessKeyId || !secretAccessKey || !publicBaseUrl) {
    return null;
  }

  return { region, bucket, accessKeyId, secretAccessKey, publicBaseUrl };
}

// The checksum is only calculated when required, so it never lands in the signed URL.
function createClient(config: S3Config): S3Client {
  return new S3Client({
    region: config.region,
    credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
}

// Signing the content type and length means the browser cannot send a different type or size.
export const createUploadUrl: UploadUrlSigner = async (key, contentType, size) => {
  const config = readS3Config();

  if (!config) {
    throw new Error("S3 is not configured.");
  }

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });

  return getSignedUrl(createClient(config), command, {
    expiresIn: UPLOAD_URL_EXPIRES_SECONDS,
    signableHeaders: new Set(["content-type", "content-length"]),
  });
};
