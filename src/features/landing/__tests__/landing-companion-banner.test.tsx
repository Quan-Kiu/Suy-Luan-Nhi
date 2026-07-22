import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LandingCompanionBanner } from "@/features/landing/landing-companion-banner";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

describe("LandingCompanionBanner", () => {
  it("keeps the approved companion message on the landing page", () => {
    render(<LandingCompanionBanner content={{}} />);

    expect(screen.getByRole("heading", { name: "Đồng hành cùng bé" })).toBeVisible();
    expect(screen.getByText("Theo dõi tiến bộ riêng tư để hiểu bé hơn và động viên đúng lúc.")).toBeVisible();
    expect(
      screen.getByText("Suy Luận Nhí được xây dựng với tình yêu thương và sự thấu hiểu trẻ em."),
    ).toBeVisible();
    expect(screen.getByRole("img", { name: "Nhím nhỏ đang xem bản đồ" })).toBeVisible();
  });
});
