import { apiRequest } from "@/lib/api/client";
import type { SystemFeedbackStatus } from "@/domain/system-feedback";
import type { FeedbackAttachment } from "@/api/feedback";

export type SystemFeedbackItem = {
  id: string;
  content: string;
  pagePath: string;
  pageTitle: string | null;
  context: Record<string, unknown>;
  status: SystemFeedbackStatus;
  adminNote: string | null;
  handledBy: string | null;
  handledAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string | null;
  userName: string;
  userEmail: string;
  attachments: Array<FeedbackAttachment & { feedbackId: string; sortOrder: number }>;
};

export type SystemFeedbackPage = {
  items: SystemFeedbackItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const adminFeedbackApi = {
  list(status?: SystemFeedbackStatus) {
    return apiRequest<SystemFeedbackPage>({
      url: "/api/admin/feedback",
      method: "GET",
      params: { status, pageSize: 100 },
    });
  },
  update(feedbackId: string, input: { status: SystemFeedbackStatus; adminNote?: string }) {
    return apiRequest<SystemFeedbackItem>({
      url: `/api/admin/feedback/${feedbackId}`,
      method: "PATCH",
      data: input,
    });
  },
};
