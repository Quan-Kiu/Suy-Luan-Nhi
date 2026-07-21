import { env } from "@/config/env";
import { cloudinaryStorageProvider } from "@/modules/media/storage/providers/cloudinary";
import { localStorageProvider, readLocalMedia } from "@/modules/media/storage/providers/local";
import { s3StorageProvider } from "@/modules/media/storage/providers/s3";
import type { ImageUploadPolicy } from "@/domain/media-upload-policy";
import type { StorageProviderName } from "@/modules/media/storage/types";
import { validateMedia } from "@/modules/media/storage/validation";

const providers = {
  local: localStorageProvider,
  s3: s3StorageProvider,
  cloudinary: cloudinaryStorageProvider,
} as const;

export async function storeMedia(file: File, options: { imagePolicy?: ImageUploadPolicy } = {}) {
  const validated = await validateMedia(file, options);
  return providers[env.STORAGE_DRIVER].upload(validated);
}

export async function deleteStoredMedia(
  provider: StorageProviderName,
  storageKey: string,
  metadata?: Record<string, unknown>,
) {
  return providers[provider].delete(storageKey, metadata);
}

export { readLocalMedia };
export type { MediaType, StorageProviderName, StoredMedia } from "@/modules/media/storage/types";
