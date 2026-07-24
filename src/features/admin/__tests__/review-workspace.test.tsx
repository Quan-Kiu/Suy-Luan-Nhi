import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ReviewWorkspace, type ReviewWorkspaceItem } from "@/features/admin/review-workspace";

const items: ReviewWorkspaceItem[] = [
  {
    missionId: "mission-pending",
    title: "Nhiệm vụ chờ duyệt",
    coverUrl: "/assets/cards/mission-thumb-footprint-detective.png",
    worldTitle: "Thám tử Quy luật",
    scheduledFor: null,
    version: {
      id: "version-pending",
      status: "in_review",
      versionNumber: 2,
      createdAt: "2026-07-24T02:00:00.000Z",
      reviewedAt: null,
    },
  },
  {
    missionId: "mission-approved",
    title: "Nhiệm vụ chờ xuất bản",
    coverUrl: "/assets/cards/mission-thumb-footprint-detective.png",
    worldTitle: "Thám tử Quy luật",
    scheduledFor: null,
    version: {
      id: "version-approved",
      status: "approved",
      versionNumber: 3,
      createdAt: "2026-07-23T02:00:00.000Z",
      reviewedAt: "2026-07-24T01:00:00.000Z",
    },
  },
];

describe("ReviewWorkspace", () => {
  it("shows pending and approved content in separate shared tabs", async () => {
    const user = userEvent.setup();
    render(<ReviewWorkspace items={items} content={{}} />);

    const pendingTab = screen.getByRole("tab", { name: "Chờ kiểm tra" });
    const approvedTab = screen.getByRole("tab", { name: "Đã duyệt, chờ hiển thị" });
    expect(pendingTab).toHaveAttribute("aria-selected", "true");
    expect(approvedTab).toHaveAttribute("aria-selected", "false");
    expect(within(pendingTab).getByText("1")).toBeInTheDocument();

    const pendingPanel = screen.getByRole("tabpanel", { name: "Chờ kiểm tra" });
    expect(within(pendingPanel).getByText("Nhiệm vụ chờ duyệt")).toBeInTheDocument();
    expect(within(pendingPanel).queryByText("Nhiệm vụ chờ xuất bản")).not.toBeInTheDocument();

    await user.click(approvedTab);

    expect(approvedTab).toHaveAttribute("aria-selected", "true");
    const approvedPanel = screen.getByRole("tabpanel", { name: "Đã duyệt, chờ hiển thị" });
    expect(within(approvedPanel).getByText("Nhiệm vụ chờ xuất bản")).toBeInTheDocument();
    expect(within(approvedPanel).queryByText("Nhiệm vụ chờ duyệt")).not.toBeInTheDocument();
  });
});
