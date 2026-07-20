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
