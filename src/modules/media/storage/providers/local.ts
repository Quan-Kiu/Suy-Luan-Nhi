import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/config/env";
import type { StorageProvider, ValidatedMedia } from "@/modules/media/storage/types";

function localUploadRoot() {
  const normalized = env.LOCAL_UPLOAD_DIR.replaceAll("\\", "/").replace(/^\.\//, "");
  const prefix = "public/uploads";
  if (normalized !== prefix && !normalized.startsWith(`${prefix}/`)) {
    throw new Error("LOCAL_UPLOAD_DIR must stay inside public/uploads");
  }
  const suffix = normalized.slice(prefix.length).replace(/^\/+/, "");
  return path.join(process.cwd(), "public", "uploads", suffix);
}

function createStorageKey(input: ValidatedMedia) {
  return `${input.mediaType}/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${input.extension}`;
}

export const localStorageProvider: StorageProvider = {
  name: "local",
  async upload(input) {
    const storageKey = createStorageKey(input);
    const absolutePath = path.resolve(localUploadRoot(), storageKey);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.buffer, { flag: "wx" });
    return {
      mimeType: input.mimeType,
      extension: input.extension,
      mediaType: input.mediaType,
      size: input.size,
      provider: "local",
      storageKey,
      url: `${env.PUBLIC_UPLOAD_BASE_URL.replace(/\/$/, "")}/${storageKey}`,
      metadata: {},
    };
  },
  async delete(storageKey) {
    const uploadRoot = localUploadRoot();
    const absolutePath = path.resolve(uploadRoot, storageKey);
    if (!absolutePath.startsWith(`${uploadRoot}${path.sep}`)) throw new Error("Invalid storage key");
    await rm(absolutePath, { force: true });
  },
};

const mimeTypeByExtension = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
  [".avif", "image/avif"],
  [".mp3", "audio/mpeg"],
  [".wav", "audio/wav"],
  [".ogg", "audio/ogg"],
  [".mp4", "video/mp4"],
  [".webm", "video/webm"],
  [".mov", "video/quicktime"],
]);
function configuredPublicPrefix() {
  const pathname = new URL(env.PUBLIC_UPLOAD_BASE_URL, "http://local").pathname;
  const segments = pathname.split("/").filter(Boolean);
  if (segments[0] !== "uploads") throw new Error("PUBLIC_UPLOAD_BASE_URL must stay below /uploads");
  return segments.slice(1);
}

export async function readLocalMedia(publicSegments: string[]) {
  if (env.STORAGE_DRIVER !== "local") return null;
  const prefix = configuredPublicPrefix();
  if (prefix.some((segment, index) => publicSegments[index] !== segment)) return null;
  const keySegments = publicSegments.slice(prefix.length);
  const invalid = keySegments.some(
    (segment) => !segment || segment === "." || segment === ".." || /[\\/\0]/.test(segment),
  );
  if (!keySegments.length || invalid) return null;

  const uploadRoot = localUploadRoot();
  const absolutePath = path.resolve(uploadRoot, keySegments.join("/"));
  if (!absolutePath.startsWith(`${uploadRoot}${path.sep}`)) return null;
  const mimeType = mimeTypeByExtension.get(path.extname(absolutePath).toLowerCase());
  if (!mimeType) return null;
  try {
    return { buffer: await readFile(absolutePath), mimeType };
  } catch {
    return null;
  }
}
