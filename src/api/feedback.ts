import { apiRequest } from "@/lib/api/client";
import type { ImageUploadPolicies } from "@/domain/media-upload-policy";

export type FeedbackAttachment = {
  id: string;
  url: string;
  altText: string;
  fileName: string;
  mimeType: string;
  size: number;
};

export type CreatedSystemFeedback = {
  id: string;
  content: string;
  status: "new" | "in_progress" | "resolved" | "dismissed";
  createdAt: string;
  attachments: FeedbackAttachment[];
};

export type FeedbackUploadConfig = {
  enabled: boolean;
  maxAttachments: number;
  policies: ImageUploadPolicies;
};

export const feedbackApi = {
  getUploadConfig() {
    return apiRequest<FeedbackUploadConfig>({ url: "/api/feedback", method: "GET" });
  },
  create(input: {
    content: string;
    images: File[];
    pagePath: string;
    pageTitle: string;
    viewportWidth: number;
    viewportHeight: number;
    devicePixelRatio: number;
    captureMode: "auto" | "upload" | "mixed" | "none";
  }) {
    const data = new FormData();
    data.set("content", input.content);
    data.set("pagePath", input.pagePath);
    data.set("pageTitle", input.pageTitle);
    data.set("viewportWidth", String(input.viewportWidth));
    data.set("viewportHeight", String(input.viewportHeight));
    data.set("devicePixelRatio", String(input.devicePixelRatio));
    data.set("captureMode", input.captureMode);
    input.images.forEach((image) => data.append("images", image));
    return apiRequest<CreatedSystemFeedback>({ url: "/api/feedback", method: "POST", data });
  },
};
