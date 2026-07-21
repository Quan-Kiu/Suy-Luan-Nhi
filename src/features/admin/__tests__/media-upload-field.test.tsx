import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mediaApi } from "@/api/admin/media";
import { defaultImageUploadPolicies } from "@/domain/media-upload-policy";
import { MediaUploadField } from "@/features/admin/media-upload-field";

function renderField() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MediaUploadField
        label="Ảnh bìa nhiệm vụ"
        category="mission-cover"
        altText="Ảnh minh họa"
        onChange={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

describe("MediaUploadField", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(mediaApi, "getUploadPolicies").mockResolvedValue(defaultImageUploadPolicies);
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
