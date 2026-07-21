import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import type { ImageUploadPolicy } from "@/domain/media-upload-policy";
import { MediaValidationError } from "@/modules/media/storage/errors";
import type { MediaType, ValidatedMedia } from "@/modules/media/storage/types";

type MediaRule = {
  extension: string;
  mediaType: MediaType;
  maxSize: number;
};

type ValidationOptions = { imagePolicy?: ImageUploadPolicy };
const mb = 1024 * 1024;
const allowedTypes = new Map<string, MediaRule>([
  ["image/png", { extension: "png", mediaType: "image", maxSize: 10 * mb }],
  ["image/jpeg", { extension: "jpg", mediaType: "image", maxSize: 10 * mb }],
  ["image/webp", { extension: "webp", mediaType: "image", maxSize: 10 * mb }],
  ["image/gif", { extension: "gif", mediaType: "image", maxSize: 10 * mb }],
  ["image/avif", { extension: "avif", mediaType: "image", maxSize: 10 * mb }],
  ["audio/mpeg", { extension: "mp3", mediaType: "audio", maxSize: 20 * mb }],
  ["audio/wav", { extension: "wav", mediaType: "audio", maxSize: 20 * mb }],
  ["audio/ogg", { extension: "ogg", mediaType: "audio", maxSize: 20 * mb }],
  ["video/mp4", { extension: "mp4", mediaType: "video", maxSize: 50 * mb }],
  ["video/webm", { extension: "webm", mediaType: "video", maxSize: 50 * mb }],
  ["video/quicktime", { extension: "mov", mediaType: "video", maxSize: 50 * mb }],
]);
function validateDimensions(width: number, height: number, policy: ImageUploadPolicy) {
  const checks: Array<[boolean, string]> = [
    [policy.minWidth !== null && width < policy.minWidth, `Ảnh cần rộng ít nhất ${policy.minWidth}px`],
    [policy.minHeight !== null && height < policy.minHeight, `Ảnh cần cao ít nhất ${policy.minHeight}px`],
    [policy.maxWidth !== null && width > policy.maxWidth, `Ảnh chỉ được rộng tối đa ${policy.maxWidth}px`],
    [policy.maxHeight !== null && height > policy.maxHeight, `Ảnh chỉ được cao tối đa ${policy.maxHeight}px`],
  ];
  const failed = checks.find(([condition]) => condition);
  if (failed) throw new MediaValidationError(failed[1]);
}

export async function validateMedia(file: File, options: ValidationOptions = {}): Promise<ValidatedMedia> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(
    new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength),
  );
  const mimeType = detected?.mime ?? file.type;
  const rule = allowedTypes.get(mimeType);

  if (!rule) {
    throw new MediaValidationError(
      "Chỉ hỗ trợ ảnh PNG/JPEG/WebP/GIF/AVIF, âm thanh MP3/WAV/OGG và video MP4/WebM/MOV",
    );
  }
  if (buffer.length > rule.maxSize) {
    throw new MediaValidationError(`Tệp vượt quá giới hạn an toàn ${Math.round(rule.maxSize / mb)}MB`);
  }
  const imagePolicy = rule.mediaType === "image" ? options.imagePolicy : undefined;
  if (imagePolicy?.sizeValidationEnabled && buffer.length > imagePolicy.maxSizeMb * mb) {
    throw new MediaValidationError(`Ảnh vượt quá giới hạn ${imagePolicy.maxSizeMb}MB của mục này`);
  }
  if (imagePolicy?.dimensionValidationEnabled) {
    const metadata = await sharp(buffer, { animated: true }).metadata();
    if (!metadata.width || !metadata.height) {
      throw new MediaValidationError("Không đọc được kích thước ảnh. Hãy chọn ảnh khác.");
    }
    validateDimensions(metadata.width, metadata.height, imagePolicy);
  }

  return {
    buffer,
    mimeType,
    extension: rule.extension,
    mediaType: rule.mediaType,
    size: buffer.length,
  };
}
