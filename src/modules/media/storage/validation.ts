import { fileTypeFromBuffer } from "file-type";
import type { MediaType, ValidatedMedia } from "@/modules/media/storage/types";

type MediaRule = {
  extension: string;
  mediaType: MediaType;
  maxSize: number;
};

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
export async function validateMedia(file: File): Promise<ValidatedMedia> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = await fileTypeFromBuffer(buffer);
  const mimeType = detected?.mime ?? file.type;
  const rule = allowedTypes.get(mimeType);

  if (!rule) {
    throw new Error("Chỉ hỗ trợ ảnh PNG/JPEG/WebP/GIF/AVIF, âm thanh MP3/WAV/OGG và video MP4/WebM/MOV");
  }
  if (buffer.length > rule.maxSize) {
    throw new Error(`Tệp vượt quá giới hạn ${Math.round(rule.maxSize / mb)}MB`);
  }

  return {
    buffer,
    mimeType,
    extension: rule.extension,
    mediaType: rule.mediaType,
    size: buffer.length,
  };
}
