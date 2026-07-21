import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { contentApi } from "@/api/content";
import { mediaApi, type MediaItem } from "@/api/admin/media";
import { MediaCard } from "@/features/admin/media-card";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const item: MediaItem = {
  id: "media-1",
  type: "image",
  storageProvider: "cloudinary",
  category: "mission-cover",
  url: "https://res.cloudinary.com/demo/image/upload/mission-cover.png",
  altText: "Ảnh minh họa nhiệm vụ",
  fileName: "mission-cover.png",
  mimeType: "image/png",
  size: 123,
  safetyStatus: "approved",
  createdAt: "2026-07-21T00:00:00.000Z",
};

function renderCard({
  media = item,
  canDelete = false,
  onDeleted = vi.fn(),
}: { media?: MediaItem; canDelete?: boolean; onDeleted?: (mediaId: string) => void } = {}) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={client}>
      <MediaCard
        item={media}
        canReview={false}
        canDelete={canDelete}
        onUpdated={vi.fn()}
        onDeleted={onDeleted}
      />
    </QueryClientProvider>,
  );
}

describe("MediaCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(contentApi, "getNamespace").mockResolvedValue({});
  });

  it("copies the media URL from the quick action", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined);

    renderCard();
    await user.click(screen.getByRole("button", { name: "Sao chép liên kết" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith(item.url));
    expect(toast.success).toHaveBeenCalledWith("Đã sao chép liên kết");
    expect(screen.getByRole("button", { name: "Đã sao chép liên kết" })).toBeInTheDocument();
  });
  it("explains that deleting a feedback image also removes it from the feedback", async () => {
    const user = userEvent.setup();
    const onDeleted = vi.fn();
    vi.spyOn(mediaApi, "remove").mockResolvedValue({});

    renderCard({
      media: { ...item, category: "feedback-attachment", fileName: "feedback.jpg" },
      canDelete: true,
      onDeleted,
    });
    await user.click(screen.getByRole("button", { name: "Xóa tệp" }));

    expect(
      screen.getByText("Ảnh sẽ bị xóa khỏi góp ý đang đính kèm và không thể khôi phục."),
    ).toBeInTheDocument();
    await user.click(within(screen.getByRole("alertdialog")).getByRole("button", { name: "Xóa tệp" }));

    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith(item.id));
  });
});
