export const mediaCategories = [
  "general",
  "mission-cover",
  "world-cover",
  "badge-icon",
  "question-asset",
  "resource-cover",
  "feedback-attachment",
  "audio-guide",
  "video-guide",
] as const;

export type MediaCategory = (typeof mediaCategories)[number];

export const mediaCategoryLabels: Record<MediaCategory, string> = {
  general: "Dùng chung",
  "mission-cover": "Ảnh bìa nhiệm vụ",
  "world-cover": "Ảnh bìa chủ đề",
  "badge-icon": "Ảnh huy hiệu",
  "question-asset": "Hình dùng trong câu hỏi",
  "resource-cover": "Ảnh bìa bài viết",
  "feedback-attachment": "Ảnh đính kèm góp ý",
  "audio-guide": "Âm thanh hướng dẫn",
  "video-guide": "Video hướng dẫn",
};

export const mediaTypeLabels = { image: "Hình ảnh", audio: "Âm thanh", video: "Video" } as const;
