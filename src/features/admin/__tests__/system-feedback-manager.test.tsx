import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  adminFeedbackApi,
  type SystemFeedbackColumnsInitialData,
  type SystemFeedbackItem,
  type SystemFeedbackPage,
} from "@/api/admin/feedback";
import type { SystemFeedbackStatus } from "@/domain/system-feedback";
import { SystemFeedbackManager } from "@/features/admin/system-feedback-manager";

function makeFeedback(id: string, overrides: Partial<SystemFeedbackItem> = {}): SystemFeedbackItem {
  return {
    id,
    content: "Nút tiếp tục bị che trên điện thoại.",
    pagePath: "/missions/demo",
    pageTitle: `Nhiệm vụ ${id}`,
    context: { viewportWidth: 390, viewportHeight: 844, captureMode: "auto" },
    fingerprint: null,
    occurrenceCount: 1,
    firstSeenAt: "2026-07-21T10:00:00.000Z",
    lastSeenAt: "2026-07-21T10:00:00.000Z",
    status: "new",
    adminNote: null,
    handledBy: null,
    handledAt: null,
    createdAt: "2026-07-21T10:00:00.000Z",
    updatedAt: "2026-07-21T10:00:00.000Z",
    userId: null,
    userName: "Khách chưa đăng nhập",
    userEmail: "Không có thông tin",
    attachments: [],
    ...overrides,
  };
}

const feedbackItem = makeFeedback("feedback-1", {
  pageTitle: "Nhiệm vụ demo",
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
});

function page(
  items: SystemFeedbackItem[],
  total = items.length,
  pageNumber = 1,
  totalPages = Math.max(1, Math.ceil(total / 10)),
): SystemFeedbackPage {
  return { items, total, page: pageNumber, pageSize: 10, totalPages };
}

function emptyPage(): SystemFeedbackPage {
  return page([]);
}

const initialData: SystemFeedbackColumnsInitialData = {
  new: page([feedbackItem]),
  in_progress: emptyPage(),
  resolved: emptyPage(),
  dismissed: emptyPage(),
};

function renderManager(data: SystemFeedbackColumnsInitialData = initialData) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <SystemFeedbackManager initialData={data} />
    </QueryClientProvider>,
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SystemFeedbackManager", () => {
  it("shows feedback in independently scrollable status columns", () => {
    renderManager();

    expect(screen.getByText("Bảng tiến độ góp ý")).toBeVisible();
    expect(screen.getByRole("region", { name: "Mới nhận, 1 góp ý" })).toBeVisible();
    expect(screen.getByRole("region", { name: "Đang xử lý, 0 góp ý" })).toBeVisible();
    expect(screen.getByTestId("feedback-column-scroll-new")).toHaveClass("overflow-y-auto");
    expect(screen.getByRole("article", { name: "Góp ý: Nhiệm vụ demo" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Kéo góp ý Nhiệm vụ demo" })).toBeEnabled();
  });

  it("shows the aggregated occurrence count for repeated automatic errors", () => {
    renderManager({
      ...initialData,
      new: page([
        makeFeedback("feedback-repeat", {
          pageTitle: "Báo cáo lỗi tự động",
          occurrenceCount: 12,
          lastSeenAt: "2026-07-27T10:30:00.000Z",
          context: {
            reportKind: "automatic_error",
            source: "window_error",
            error: { name: "Error", message: "Render failed", details: {} },
            breadcrumbs: [],
          },
        }),
      ]),
    });

    expect(screen.getByText("×12 lần")).toBeVisible();
  });

  it("loads the next page only for the column that reaches its end", async () => {
    const firstPageItems = Array.from({ length: 10 }, (_, index) => makeFeedback(`feedback-${index + 1}`));
    const nextItem = makeFeedback("feedback-11", { pageTitle: "Nhiệm vụ tải thêm" });
    const data: SystemFeedbackColumnsInitialData = {
      ...initialData,
      new: page(firstPageItems, 11, 1, 2),
    };
    const list = vi
      .spyOn(adminFeedbackApi, "list")
      .mockImplementation(async ({ status, page: pageNumber }) => {
        expect(status).toBe("new");
        expect(pageNumber).toBe(2);
        return page([nextItem], 11, 2, 2);
      });
    renderManager(data);

    const scrollArea = screen.getByTestId("feedback-column-scroll-new");
    Object.defineProperties(scrollArea, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 1200 },
    });
    scrollArea.scrollTop = 650;
    fireEvent.scroll(scrollArea);

    expect(await screen.findByRole("article", { name: "Góp ý: Nhiệm vụ tải thêm" })).toBeVisible();
    expect(list).toHaveBeenCalledTimes(1);
    expect(list).toHaveBeenCalledWith({ status: "new", page: 2, pageSize: 10 });
  });

  it("opens the full details dialog and persists status and notes", async () => {
    const user = userEvent.setup();
    const updatedItem = {
      ...feedbackItem,
      status: "in_progress" as const,
      adminNote: "Đã tái hiện trên iPhone.",
    };
    const update = vi.spyOn(adminFeedbackApi, "update").mockResolvedValue(updatedItem);
    vi.spyOn(adminFeedbackApi, "list").mockImplementation(async ({ status }) => {
      const items = status === "in_progress" ? [updatedItem] : [];
      return page(items);
    });
    renderManager();

    await user.click(screen.getByRole("button", { name: "Chi tiết" }));

    const dialog = await screen.findByRole("dialog", { name: "Nhiệm vụ demo" });
    await waitFor(() => expect(dialog).toBeVisible());
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

  it("keeps each status API request isolated", async () => {
    const list = vi.spyOn(adminFeedbackApi, "list").mockResolvedValue(emptyPage());
    const data = {
      ...initialData,
      resolved: page(
        Array.from({ length: 10 }, (_, index) =>
          makeFeedback(`resolved-${index}`, {
            status: "resolved" as SystemFeedbackStatus,
          }),
        ),
        11,
        1,
        2,
      ),
    };
    renderManager(data);

    const scrollArea = screen.getByTestId("feedback-column-scroll-resolved");
    Object.defineProperties(scrollArea, {
      clientHeight: { configurable: true, value: 400 },
      scrollHeight: { configurable: true, value: 1000 },
    });
    scrollArea.scrollTop = 500;
    fireEvent.scroll(scrollArea);

    await waitFor(() => expect(list).toHaveBeenCalled());
    expect(list.mock.calls.every(([input]) => input.status === "resolved")).toBe(true);
  });

  it("shows privacy-filtered technical details for automatic error reports", async () => {
    const user = userEvent.setup();
    const automaticItem: SystemFeedbackItem = {
      ...feedbackItem,
      id: "feedback-auto",
      content: "[Báo cáo lỗi tự động] Error: API POST /api/children thất bại",
      pageTitle: "Báo cáo lỗi tự động",
      attachments: [],
      context: {
        reportKind: "automatic_error",
        source: "api_failure",
        error: {
          name: "Error",
          message: "API POST /api/children thất bại",
          stack: "Error: API failure\n    at submitChild",
          details: { status: 500, requestId: "req-123" },
        },
        breadcrumbs: [
          {
            timestamp: "2026-07-21T09:59:59.000Z",
            category: "interaction",
            action: "form.submit",
            data: { method: "POST", action: "/api/children" },
          },
        ],
        viewportWidth: 390,
        viewportHeight: 844,
        devicePixelRatio: 3,
        userAgent: "Mobile Safari",
      },
    };
    renderManager({ ...initialData, new: page([automaticItem]) });

    expect(screen.getByText("Lỗi tự động")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Chi tiết" }));

    const dialog = screen.getByRole("dialog", { name: "Báo cáo lỗi tự động" });
    expect(within(dialog).getByText("Yêu cầu API thất bại")).toBeInTheDocument();
    expect(within(dialog).getByText("req-123")).toBeInTheDocument();
    expect(within(dialog).getByText("Các bước gần nhất (1)")).toBeInTheDocument();
    expect(within(dialog).getByText(/form.submit/)).toBeInTheDocument();
    expect(within(dialog).getByText("Mobile Safari")).toBeInTheDocument();
  });
});
