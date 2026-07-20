export const storageProviderNames = ["local", "s3", "cloudinary"] as const;

export type StorageProviderName = (typeof storageProviderNames)[number];
export type MediaType = "image" | "audio" | "video";

export type ValidatedMedia = {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  mediaType: MediaType;
  size: number;
};

export type StoredMedia = Omit<ValidatedMedia, "buffer"> & {
  provider: StorageProviderName;
  storageKey: string;
  url: string;
  metadata: Record<string, unknown>;
};

export interface StorageProvider {
  readonly name: StorageProviderName;
  upload(input: ValidatedMedia): Promise<StoredMedia>;
  delete(storageKey: string, metadata?: Record<string, unknown>): Promise<void>;
}
