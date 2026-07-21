import { v2 as cloudinary, type UploadApiErrorResponse, type UploadApiResponse } from "cloudinary";
import { env } from "@/config/env";
import { MediaStorageError } from "@/modules/media/storage/errors";
import type { StorageProvider, ValidatedMedia } from "@/modules/media/storage/types";

function configureCloudinary() {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME!,
    api_key: env.CLOUDINARY_API_KEY!,
    api_secret: env.CLOUDINARY_API_SECRET!,
    secure: true,
  });
  return cloudinary;
}

function resourceType(input: ValidatedMedia) {
  return input.mediaType === "image" ? ("image" as const) : ("video" as const);
}

function toStorageError(
  error: UploadApiErrorResponse,
  context: { retriedWithoutPreset?: boolean } = {},
) {
  const message = error.message || "Cloudinary upload failed";
  console.error("[media.cloudinary.upload_failed]", {
    httpCode: error.http_code,
    name: error.name,
    message,
    retriedWithoutPreset: context.retriedWithoutPreset ?? false,
  });
  if (/cloud_name is disabled/i.test(message)) {
    return new MediaStorageError(
      "Kho lưu trữ hình ảnh đang bị tạm khóa. Hãy kiểm tra lại trạng thái tài khoản Cloudinary.",
      { cause: error },
    );
  }
  if (error.http_code === 401) {
    return new MediaStorageError(
      "Không thể xác thực với kho lưu trữ hình ảnh. Hãy kiểm tra lại cấu hình Cloudinary.",
      { cause: error },
    );
  }
  if (error.http_code === 403) {
    return new MediaStorageError(
      context.retriedWithoutPreset
        ? "Cloudinary đang từ chối quyền tải lên. Hãy kiểm tra trạng thái tài khoản và quyền của API key."
        : "Cloudinary đang từ chối quyền tải lên. Hãy kiểm tra upload preset và quyền của API key.",
      { cause: error },
    );
  }
  return new MediaStorageError("Kho lưu trữ chưa sẵn sàng. Hãy thử lại sau.", { cause: error });
}

function uploadOnce(input: ValidatedMedia, includeUploadPreset: boolean) {
  const uploadPreset = env.CLOUDINARY_UPLOAD_PRESET?.trim();
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = configureCloudinary().uploader.upload_stream(
      {
        resource_type: resourceType(input),
        folder: env.CLOUDINARY_FOLDER,
        ...(includeUploadPreset && uploadPreset ? { upload_preset: uploadPreset } : {}),
        overwrite: false,
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error) reject(error);
        else if (!result) reject(new MediaStorageError("Cloudinary không trả về kết quả tải lên"));
        else resolve(result);
      },
    );
    stream.end(input.buffer);
  });
}

async function upload(input: ValidatedMedia) {
  const hasUploadPreset = Boolean(env.CLOUDINARY_UPLOAD_PRESET?.trim());
  try {
    return await uploadOnce(input, hasUploadPreset);
  } catch (error) {
    if (error instanceof MediaStorageError) throw error;
    const uploadError = error as UploadApiErrorResponse;
    if (hasUploadPreset && uploadError.http_code === 403) {
      console.warn("[media.cloudinary.retry_without_preset]", {
        httpCode: uploadError.http_code,
      });
      try {
        return await uploadOnce(input, false);
      } catch (retryError) {
        if (retryError instanceof MediaStorageError) throw retryError;
        throw toStorageError(retryError as UploadApiErrorResponse, {
          retriedWithoutPreset: true,
        });
      }
    }
    throw toStorageError(uploadError);
  }
}

export const cloudinaryStorageProvider: StorageProvider = {
  name: "cloudinary",
  async upload(input) {
    const result = await upload(input);
    return {
      mimeType: input.mimeType,
      extension: input.extension,
      mediaType: input.mediaType,
      size: input.size,
      provider: "cloudinary",
      storageKey: result.public_id,
      url: result.secure_url,
      metadata: {
        resourceType: result.resource_type,
        format: result.format,
        width: result.width,
        height: result.height,
        duration: result.duration,
        version: result.version,
      },
    };
  },
  async delete(storageKey, metadata) {
    const resourceType = metadata?.resourceType === "video" ? "video" : "image";
    await configureCloudinary().uploader.destroy(storageKey, {
      resource_type: resourceType,
      invalidate: true,
    });
  },
};
