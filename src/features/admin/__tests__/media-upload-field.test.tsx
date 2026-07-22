import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mediaApi } from "@/api/admin/media";
import { defaultImageUploadPolicies } from "@/domain/media-upload-policy";
import { MediaUploadField } from "@/features/admin/media-upload-field";

function renderField(onChange = vi.fn()) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MediaUploadField
        label="Ảnh bìa nhiệm vụ"
        category="mission-cover"
        altText="Ảnh minh họa"
        onChange={onChange}
      />
    </QueryClientProvider>,
  );
}

describe("MediaUploadField", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(mediaApi, "getUploadPolicies").mockResolvedValue(defaultImageUploadPolicies);
  });
  it("opens a hidden file input from an accessible button", async () => {
    const user = userEvent.setup();
    const { container } = renderField();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const click = vi.spyOn(input, "click");

    expect(input).toHaveAttribute("hidden");
    await user.click(screen.getByRole("button", { name: /Ảnh bìa nhiệm vụ.*Tải tệp mới/ }));
    expect(click).toHaveBeenCalledOnce();
  });

  it("selects a compatible existing item from the media library", async () => {
    const onChange = vi.fn();
    vi.spyOn(mediaApi, "list").mockResolvedValue({
      items: [
        {
          id: "media-1",
          type: "image",
          storageProvider: "cloudinary",
          category: "mission-cover",
          url: "https://example.com/mission-cover.png",
          altText: "Ảnh bìa khu vườn",
          fileName: "mission-cover.png",
          mimeType: "image/png",
          size: 1024,
          safetyStatus: "approved",
          createdAt: "2026-07-22T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
      pageSize: 12,
      totalPages: 1,
      facets: {
        types: ["image"],
        categories: ["mission-cover"],
        safetyStatuses: ["approved"],
        storageProviders: ["cloudinary"],
      },
    });
    const user = userEvent.setup();
    renderField(onChange);

    await user.click(screen.getByRole("button", { name: /Ảnh bìa nhiệm vụ.*Chọn từ thư viện/ }));
    expect(await screen.findByRole("dialog", { name: "Chọn từ thư viện" })).toBeInTheDocument();
    expect(mediaApi.list).toHaveBeenCalledWith(
      expect.objectContaining({ type: "image", category: "mission-cover", page: 1, pageSize: 12 }),
    );

    await user.click(screen.getByRole("button", { name: "Chọn tư liệu này" }));
    expect(onChange).toHaveBeenCalledWith("https://example.com/mission-cover.png");
    expect(screen.queryByRole("dialog", { name: "Chọn từ thư viện" })).not.toBeInTheDocument();
  });

  it("allows selecting the same file again after an upload error", async () => {
    const upload = vi.spyOn(mediaApi, "upload").mockRejectedValue(new Error("Kho lưu trữ chưa sẵn sàng"));
    const user = userEvent.setup();
    const { container } = renderField();
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["image"], "same-image.png", { type: "image/png" });

    await user.upload(input, file);
    expect(await screen.findByText("Kho lưu trữ chưa sẵn sàng")).toBeInTheDocument();
    expect(input.value).toBe("");

    await user.upload(input, file);
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2));
  });
});
