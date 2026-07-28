export const parentResourceTypes = ["article", "guide", "activity", "video"] as const;
export type ParentResourceType = (typeof parentResourceTypes)[number];

export const parentResourceTypeLabels: Record<ParentResourceType, string> = {
  article: "Bài viết",
  guide: "Hướng dẫn",
  activity: "Hoạt động cùng bé",
  video: "Video",
};

export const parentResourceCategories = [
  "companionship",
  "conversation",
  "emotional-safety",
  "thinking",
  "digital-safety",
] as const;
export type ParentResourceCategory = (typeof parentResourceCategories)[number];

export const parentResourceCategoryLabels: Record<ParentResourceCategory, string> = {
  companionship: "Đồng hành",
  conversation: "Trò chuyện",
  "emotional-safety": "An toàn cảm xúc",
  thinking: "Phát triển tư duy",
  "digital-safety": "An toàn số",
};

export const parentResourceErrorCodes = {
  validationFailed: "RESOURCE_VALIDATION_FAILED",
  notFound: "RESOURCE_NOT_FOUND",
  slugConflict: "RESOURCE_SLUG_CONFLICT",
  revisionRequired: "RESOURCE_REVISION_REQUIRED",
  editConflict: "RESOURCE_EDIT_CONFLICT",
} as const;

export const parentResourceErrorMessages = {
  validationFailed: "Tài nguyên chưa hợp lệ",
  notFound: "Không tìm thấy tài nguyên",
  slugConflict: "Mã đường dẫn tài nguyên đã tồn tại",
  revisionRequired: "Thiếu phiên bản tài nguyên cần cập nhật",
  editConflict: "Bài viết đã được thay đổi ở nơi khác. Hãy tải phiên bản mới nhất trước khi tiếp tục.",
} as const;
