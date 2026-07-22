import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SystemFeedbackPage } from "@/api/admin/feedback";
import { SystemFeedbackManager } from "@/features/admin/system-feedback-manager";

const initialData: SystemFeedbackPage = {
  items: [
    {
      id: "feedback-1",
      content: "Nút tiếp tục bị che trên điện thoại.",
      pagePath: "/missions/demo",
      pageTitle: "Nhiệm vụ demo",
      context: { viewportWidth: 390, viewportHeight: 844, captureMode: "auto" },
      status: "new",
      adminNote: null,
      handledBy: null,
      handledAt: null,
      createdAt: "2026-07-21T10:00:00.000Z",
      updatedAt: "2026-07-21T10:00:00.000Z",
      userId: null,
      userName: "Khách chưa đăng nhập",
      userEmail: "Không có thông tin",
      attachments: [
        {
          feedbackId: "feedback-1",
          sortOrder: 0,
          id: "media-1",
          url: "/uploads/feedback.jpg",
          altText: "Ảnh trang hiện tại",
          fileName: "feedback.jpg",
          mimeType: "image/jpeg",
          size: 1234,
        },
      ],
    },
  ],
  total: 1,
  page: 1,
  pageSize: 50,
  totalPages: 1,
};

describe("SystemFeedbackManager", () => {
  it("shows page context, screenshot and processing controls", () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <SystemFeedbackManager initialData={initialData} />
      </QueryClientProvider>,
    );

    expect(screen.getByRole("heading", { name: "Nhiệm vụ demo" })).toBeVisible();
    const details = screen.getByText("Tóm tắt: Nút tiếp tục bị che trên điện thoại.").closest("details");
    expect(details).not.toBeNull();
    details!.open = true;
    expect(screen.getByText("Nút tiếp tục bị che trên điện thoại.")).toBeVisible();
    expect(screen.getByText("Màn hình: 390 × 844px")).toBeVisible();
    expect(screen.getByRole("img", { name: "Ảnh trang hiện tại" })).toBeVisible();
    expect(screen.getByLabelText("Trạng thái xử lý")).toHaveValue("new");
    expect(screen.getByRole("button", { name: "Lưu xử lý" })).toBeEnabled();
  });
});
