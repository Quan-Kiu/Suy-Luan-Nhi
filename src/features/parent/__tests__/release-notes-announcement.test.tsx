import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ReleaseNotesAnnouncement } from "@/features/parent/release-notes-announcement";
import type { ReleaseNote } from "@/modules/release-notes/release-notes";

vi.mock("next/navigation", () => ({ usePathname: () => "/parent" }));

const release: ReleaseNote = {
  version: "2026.07.24",
  title: "Cập nhật mới",
  summary: "Tóm tắt cập nhật dành cho gia đình.",
  publishedAt: "2026-07-24T08:00:00+07:00",
  announcement: true,
  items: [],
};

describe("ReleaseNotesAnnouncement", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("shows an unseen release and dismisses it for the current device", async () => {
    render(<ReleaseNotesAnnouncement release={release} />);

    await waitFor(() => expect(screen.getByText("Có cập nhật mới")).toBeInTheDocument());
    await userEvent.click(screen.getByRole("button", { name: "Đánh dấu cập nhật này là đã xem" }));

    await waitFor(() => expect(screen.queryByText("Có cập nhật mới")).not.toBeInTheDocument());
  });
});
