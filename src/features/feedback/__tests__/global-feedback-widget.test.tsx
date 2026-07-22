import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { contentApi } from "@/api/content";
import { feedbackApi } from "@/api/feedback";
import { defaultImageUploadPolicies } from "@/domain/media-upload-policy";
import { GlobalFeedbackWidget } from "@/features/feedback/global-feedback-widget";

vi.mock("next/navigation", () => ({ usePathname: () => "/missions/demo" }));

function renderWidget() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <GlobalFeedbackWidget />
    </QueryClientProvider>,
  );
}

describe("GlobalFeedbackWidget", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(contentApi, "getNamespace").mockResolvedValue({});
  });

  it("stays hidden when feedback is disabled", async () => {
    vi.spyOn(feedbackApi, "getUploadConfig").mockResolvedValue({
      enabled: false,
      maxAttachments: 5,
      policies: defaultImageUploadPolicies,
    });
    renderWidget();

    await waitFor(() => expect(feedbackApi.getUploadConfig).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: "Gửi góp ý về trang này" })).not.toBeInTheDocument();
  });

  it("shows one global feedback control when enabled", async () => {
    vi.spyOn(feedbackApi, "getUploadConfig").mockResolvedValue({
      enabled: true,
      maxAttachments: 5,
      policies: defaultImageUploadPolicies,
    });
    renderWidget();

    expect(await screen.findByRole("button", { name: "Gửi góp ý về trang này" })).toBeVisible();
  });

  it("keeps the header and actions fixed while only the content region scrolls", async () => {
    vi.spyOn(feedbackApi, "getUploadConfig").mockResolvedValue({
      enabled: true,
      maxAttachments: 0,
      policies: defaultImageUploadPolicies,
    });
    const user = userEvent.setup();
    renderWidget();

    await user.click(await screen.findByRole("button", { name: "Gửi góp ý về trang này" }));

    const dialog = screen.getByRole("dialog");
    const header = dialog.querySelector<HTMLElement>("[data-feedback-header]");
    const scrollRegion = dialog.querySelector<HTMLElement>("[data-feedback-scroll-region]");
    const actions = dialog.querySelector<HTMLElement>("[data-feedback-actions]");

    expect(header).toBeInTheDocument();
    expect(scrollRegion).toHaveClass("overflow-y-auto");
    expect(actions).toBeInTheDocument();
    expect(scrollRegion).not.toContainElement(header);
    expect(scrollRegion).not.toContainElement(actions);
  });

  it("allows text-only feedback when image attachments are disabled", async () => {
    vi.spyOn(feedbackApi, "getUploadConfig").mockResolvedValue({
      enabled: true,
      maxAttachments: 0,
      policies: defaultImageUploadPolicies,
    });
    const createFeedback = vi.spyOn(feedbackApi, "create").mockResolvedValue({
      id: "feedback-1",
      content: "Nút này đang che mất nội dung trên điện thoại.",
      status: "new",
      createdAt: new Date().toISOString(),
      attachments: [],
    });
    const user = userEvent.setup();
    renderWidget();

    await user.click(await screen.findByRole("button", { name: "Gửi góp ý về trang này" }));

    await waitFor(() =>
      expect(
        screen.getByText("Ảnh đính kèm đang được tắt. Bạn vẫn có thể gửi nội dung góp ý."),
      ).toBeVisible(),
    );
    expect(screen.getByText("Ảnh đính kèm đang tắt.")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Chụp lại trang" })).not.toBeInTheDocument();

    await user.type(
      screen.getByRole("textbox", { name: "Nội dung góp ý" }),
      "Nút này đang che mất nội dung trên điện thoại.",
    );
    await user.click(screen.getByRole("button", { name: "Gửi góp ý" }));

    await waitFor(() =>
      expect(createFeedback).toHaveBeenCalledWith(
        expect.objectContaining({
          content: "Nút này đang che mất nội dung trên điện thoại.",
          images: [],
          pagePath: "/missions/demo",
          captureMode: "none",
        }),
      ),
    );
  });
});
