import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/content/client", () => ({
  useContent: () => ({}),
  contentText: (_dictionary: unknown, _key: string, fallback: string) => fallback,
  contentTemplate: (
    _dictionary: unknown,
    _key: string,
    fallback: string,
    values: Record<string, string | number>,
  ) =>
    Object.entries(values).reduce(
      (text, [key, value]) => text.replaceAll(`{${key}}`, String(value)),
      fallback,
    ),
}));

import { MissionAutosaveStatus } from "@/features/admin/mission-autosave-status";

describe("MissionAutosaveStatus", () => {
  it("shows the latest successful save time", () => {
    render(<MissionAutosaveStatus state="saved" lastSavedAt={new Date("2026-07-24T06:30:00.000Z")} />);

    expect(screen.getByRole("status")).toHaveTextContent("Đã tự động lưu lúc");
    expect(screen.getByRole("status")).toHaveAttribute("data-state", "saved");
  });

  it("announces edit conflicts assertively", () => {
    render(<MissionAutosaveStatus state="conflict" lastSavedAt={null} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Bản nháp có thay đổi mới hơn ở nơi khác");
    expect(screen.getByRole("alert")).toHaveAttribute("data-state", "conflict");
  });
});
