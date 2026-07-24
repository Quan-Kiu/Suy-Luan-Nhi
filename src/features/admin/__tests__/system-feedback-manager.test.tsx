import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { adminFeedbackApi, type SystemFeedbackItem, type SystemFeedbackPage } from "@/api/admin/feedback";
import { SystemFeedbackManager } from "@/features/admin/system-feedback-manager";

const feedbackItem: SystemFeedbackItem = {
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
};

const initialData: SystemFeedbackPage = {
  items: [feedbackItem],
  total: 1,
  page: 1,
  pageSize: 100,
  totalPages: 1,
};

function renderManager() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <SystemFeedbackManager initialData={initialData} />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SystemFeedbackManager", () => {
  it("shows feedback in status columns as compact cards", () => {
    renderManager();

    expect(screen.getByText("Bảng tiến độ góp ý")).toBeVisible();
    expect(screen.getByRole("region", { name: "Mới nhận, 1 góp ý" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Đang xử lý, 0 góp ý" })).toBeVisible();
    expect(screen.getByRole("article", { name: "Góp ý: Nhiệm vụ demo" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Kéo góp ý Nhiệm vụ demo" })).toBeEnabled();
  });

  it("opens the full details dialog and persists status and notes", async () => {
    const user = userEvent.setup();
    const updatedItem = {
      ...feedbackItem,
      status: "in_progress" as const,
      adminNote: "Đã tái hiện trên iPhone.",
    };
    const update = vi.spyOn(adminFeedbackApi, "update").mockResolvedValue(updatedItem);
    renderManager();

    await user.click(screen.getByRole("button", { name: "Chi tiết" }));

    const dialog = screen.getByRole("dialog", { name: "Nhiệm vụ demo" });
    expect(dialog).toBeVisible();
    expect(within(dialog).getByText("Nút tiếp tục bị che trên điện thoại.")).toBeVisible();
    expect(within(dialog).getByText("Màn hình: 390 × 844px")).toBeVisible();
    expect(within(dialog).getByRole("img", { name: "Ảnh trang hiện tại" })).toBeVisible();

    await user.selectOptions(within(dialog).getByLabelText("Trạng thái xử lý"), "in_progress");
    await user.type(within(dialog).getByLabelText("Ghi chú nội bộ"), "Đã tái hiện trên iPhone.");
    await user.click(within(dialog).getByRole("button", { name: "Lưu xử lý" }));

    expect(update).toHaveBeenCalledWith("feedback-1", {
      status: "in_progress",
      adminNote: "Đã tái hiện trên iPhone.",
    });
    expect(await screen.findByRole("region", { name: "Đang xử lý, 1 góp ý" })).toBeVisible();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});
