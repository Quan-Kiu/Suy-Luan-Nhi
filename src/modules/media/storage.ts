import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fileTypeFromBuffer } from "file-type";
import { env } from "@/config/env";

const allowedTypes = new Map([
  ["image/png", { extension: "png", mediaType: "image" as const, maxSize: 10 * 1024 * 1024 }],
  ["image/jpeg", { extension: "jpg", mediaType: "image" as const, maxSize: 10 * 1024 * 1024 }],
  ["image/webp", { extension: "webp", mediaType: "image" as const, maxSize: 10 * 1024 * 1024 }],
  ["image/gif", { extension: "gif", mediaType: "image" as const, maxSize: 10 * 1024 * 1024 }],
  ["audio/mpeg", { extension: "mp3", mediaType: "audio" as const, maxSize: 20 * 1024 * 1024 }],
  ["audio/wav", { extension: "wav", mediaType: "audio" as const, maxSize: 20 * 1024 * 1024 }],
  ["audio/ogg", { extension: "ogg", mediaType: "audio" as const, maxSize: 20 * 1024 * 1024 }],
]);

function localUploadRoot() {
  const normalized = env.LOCAL_UPLOAD_DIR.replaceAll("\\", "/").replace(/^\.\//, "");
  const prefix = "public/uploads";
  if (normalized !== prefix && !normalized.startsWith(`${prefix}/`)) {
    throw new Error("LOCAL_UPLOAD_DIR must stay inside public/uploads");
  }
  const suffix = normalized.slice(prefix.length).replace(/^\/+/, "");
  return path.join(process.cwd(), "public", "uploads", suffix);
}

function s3Client() {
  return new S3Client({
    region: env.S3_REGION!,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: Boolean(env.S3_ENDPOINT),
    credentials: { accessKeyId: env.S3_ACCESS_KEY_ID!, secretAccessKey: env.S3_SECRET_ACCESS_KEY! },
  });
}

export async function validateMedia(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  const mimeType = detected?.mime ?? file.type;
  const config = allowedTypes.get(mimeType);
  if (!config) throw new Error("Chỉ hỗ trợ PNG, JPEG, WebP, GIF, MP3, WAV hoặc OGG");
  if (buffer.length > config.maxSize)
    throw new Error(`Tệp vượt quá giới hạn ${Math.round(config.maxSize / 1024 / 1024)}MB`);
  return { buffer, mimeType, ...config };
}

export async function storeMedia(file: File) {
  const validated = await validateMedia(file);
  const storageKey = `${validated.mediaType}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${validated.extension}`;
  if (env.STORAGE_DRIVER === "s3") {
    await s3Client().send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET!,
        Key: storageKey,
        Body: validated.buffer,
        ContentType: validated.mimeType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return { ...validated, storageKey, url: `${env.S3_PUBLIC_BASE_URL!.replace(/\/$/, "")}/${storageKey}` };
  }
  const absolutePath = path.resolve(localUploadRoot(), storageKey);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, validated.buffer, { flag: "wx" });
  return { ...validated, storageKey, url: `${env.PUBLIC_UPLOAD_BASE_URL.replace(/\/$/, "")}/${storageKey}` };
}

export async function deleteStoredMedia(storageKey: string) {
  if (env.STORAGE_DRIVER === "s3") {
    await s3Client().send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET!, Key: storageKey }));
    return;
  }
  const uploadRoot = localUploadRoot();
  const absolutePath = path.resolve(uploadRoot, storageKey);
  if (!absolutePath.startsWith(`${uploadRoot}${path.sep}`)) throw new Error("Invalid storage key");
  await rm(absolutePath, { force: true });
}

const mimeTypeByExtension = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".mp3", "audio/mpeg"],
  [".wav", "audio/wav"],
  [".ogg", "audio/ogg"],
]);

function configuredPublicPrefix() {
  const pathname = new URL(env.PUBLIC_UPLOAD_BASE_URL, "http://local").pathname;
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "uploads") {
    throw new Error("PUBLIC_UPLOAD_BASE_URL must stay below /uploads for local storage");
  }
  return segments.slice(1);
}
function storageKeyFromPublicSegments(segments: string[]) {
  const prefix = configuredPublicPrefix();
  if (prefix.some((segment, index) => segments[index] !== segment)) return null;

  const keySegments = segments.slice(prefix.length);
  const invalid = keySegments.some(
    (segment) =>
      !segment ||
      segment === "." ||
      segment === ".." ||
      segment.includes("/") ||
      segment.includes("\\") ||
      segment.includes("\0"),
  );
  return !keySegments.length || invalid ? null : keySegments.join("/");
}

export async function readLocalMedia(publicSegments: string[]) {
  if (env.STORAGE_DRIVER !== "local") return null;
  const storageKey = storageKeyFromPublicSegments(publicSegments);
  if (!storageKey) return null;
  const uploadRoot = localUploadRoot();
  const absolutePath = path.resolve(uploadRoot, storageKey);
  if (!absolutePath.startsWith(`${uploadRoot}${path.sep}`)) return null;

  const mimeType = mimeTypeByExtension.get(path.extname(absolutePath).toLowerCase());
  if (!mimeType) return null;

  try {
    return { buffer: await readFile(absolutePath), mimeType };
  } catch {
    return null;
  }
}
