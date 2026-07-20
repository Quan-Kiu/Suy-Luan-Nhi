import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { env } from "@/config/env";
import type { StorageProvider, ValidatedMedia } from "@/modules/media/storage/types";

function client() {
  return new S3Client({
    region: env.S3_REGION!,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: Boolean(env.S3_ENDPOINT),
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY_ID!,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY!,
    },
  });
}

function createStorageKey(input: ValidatedMedia) {
  return `${input.mediaType}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${input.extension}`;
}

export const s3StorageProvider: StorageProvider = {
  name: "s3",
  async upload(input) {
    const storageKey = createStorageKey(input);
    await client().send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET!,
        Key: storageKey,
        Body: input.buffer,
        ContentType: input.mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return {
      mimeType: input.mimeType,
      extension: input.extension,
      mediaType: input.mediaType,
      size: input.size,
      provider: "s3",
      storageKey,
      url: `${env.S3_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${storageKey}`,
      metadata: {},
    };
  },
  async delete(storageKey) {
    await client().send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET!, Key: storageKey }));
  },
};
