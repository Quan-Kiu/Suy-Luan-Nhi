import {
  defaultImageUploadPolicies,
  isImageUploadCategory,
  type ImageUploadPolicies,
} from "@/domain/media-upload-policy";
import type { MediaCategory } from "@/domain/media";

const mb = 1024 * 1024;

async function readImageDimensions(file: File) {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    const dimensions = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return dimensions;
  }
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image-load-failed"));
    };
    image.src = url;
  });
}

export function getImageUploadPolicySummary(
  category: MediaCategory,
  policies: ImageUploadPolicies = defaultImageUploadPolicies,
) {
  if (!isImageUploadCategory(category)) return null;
  const policy = policies[category];
  const parts = [
    policy.sizeValidationEnabled ? `Tối đa ${policy.maxSizeMb}MB` : "Không giới hạn dung lượng riêng",
  ];
  if (policy.dimensionValidationEnabled) {
    const width = `${policy.minWidth ?? 1}–${policy.maxWidth ?? "∞"}px`;
    const height = `${policy.minHeight ?? 1}–${policy.maxHeight ?? "∞"}px`;
    parts.push(`kích thước ${width} × ${height}`);
  }
  return parts.join(", ");
}
export async function validateImageFileForCategory(
  file: File,
  category: MediaCategory,
  policies: ImageUploadPolicies = defaultImageUploadPolicies,
) {
  if (!file.type.startsWith("image/") || !isImageUploadCategory(category)) return;
  const policy = policies[category];
  if (policy.sizeValidationEnabled && file.size > policy.maxSizeMb * mb) {
    throw new Error(`Ảnh vượt quá giới hạn ${policy.maxSizeMb}MB của mục này`);
  }
  if (!policy.dimensionValidationEnabled) return;

  let dimensions: { width: number; height: number };
  try {
    dimensions = await readImageDimensions(file);
  } catch {
    throw new Error("Không đọc được kích thước ảnh. Hãy chọn ảnh khác.");
  }
  if (policy.minWidth !== null && dimensions.width < policy.minWidth) {
    throw new Error(`Ảnh cần rộng ít nhất ${policy.minWidth}px`);
  }
  if (policy.minHeight !== null && dimensions.height < policy.minHeight) {
    throw new Error(`Ảnh cần cao ít nhất ${policy.minHeight}px`);
  }
  if (policy.maxWidth !== null && dimensions.width > policy.maxWidth) {
    throw new Error(`Ảnh chỉ được rộng tối đa ${policy.maxWidth}px`);
  }
  if (policy.maxHeight !== null && dimensions.height > policy.maxHeight) {
    throw new Error(`Ảnh chỉ được cao tối đa ${policy.maxHeight}px`);
  }
}
