export const mediaCategories = [
  "general",
  "mission-cover",
  "world-cover",
  "question-asset",
  "resource-cover",
  "audio-guide",
  "video-guide",
] as const;

export type MediaCategory = (typeof mediaCategories)[number];

export const mediaCategoryLabels: Record<MediaCategory, string> = {
  general: "Dùng chung",
  "mission-cover": "Ảnh bìa nhiệm vụ",
  "world-cover": "Ảnh bìa chủ đề",
  "question-asset": "Hình dùng trong câu hỏi",
  "resource-cover": "Ảnh bìa bài viết",
  "audio-guide": "Âm thanh hướng dẫn",
  "video-guide": "Video hướng dẫn",
};

export const mediaTypeLabels = { image: "Hình ảnh", audio: "Âm thanh", video: "Video" } as const;
