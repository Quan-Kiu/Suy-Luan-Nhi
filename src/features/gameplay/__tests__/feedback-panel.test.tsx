import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FeedbackPanel } from "@/features/gameplay/feedback-panel";

describe("FeedbackPanel", () => {
  it("uses neutral retry language and a non-success button style", () => {
    render(
      <FeedbackPanel
        correct={false}
        text="Con nhìn lại thứ tự ba hình đầu nhé."
        completeReady={false}
        completing={false}
        content={{}}
        onContinue={vi.fn()}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText("Chưa chính xác")).toBeVisible();
    const retryButton = screen.getByRole("button", { name: "Thử lại" });
    expect(retryButton.className).toContain("border-[#d99539]");
    expect(retryButton.className).toContain("bg-white");
    expect(retryButton.className).not.toMatch(/green|6c9951/i);
  });
});
