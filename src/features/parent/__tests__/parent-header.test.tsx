import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ParentHeader } from "@/features/parent/parent-header";

vi.mock("next/image", () => ({ default: () => null }));
vi.mock("@/features/auth/use-sign-out-navigation", () => ({
  useSignOutNavigation: () => ({ pending: false, signOutAndNavigate: vi.fn() }),
}));

describe("ParentHeader admin shortcut", () => {
  it("shows the admin link on desktop and in the mobile menu for authorized accounts", async () => {
    render(<ParentHeader childName="Bống" unread={0} content={{}} canAccessAdmin />);

    expect(screen.getByRole("link", { name: "Trang quản trị" })).toHaveAttribute("href", "/admin");

    await userEvent.click(screen.getByRole("button", { name: "Mở menu phụ huynh" }));
    const links = screen.getAllByRole("link", { name: "Trang quản trị" });
    expect(links).toHaveLength(2);
    expect(links.every((link) => link.getAttribute("href") === "/admin")).toBe(true);
  });

  it("keeps the admin link hidden from parent-only accounts", async () => {
    render(<ParentHeader childName="Bống" unread={0} content={{}} />);

    expect(screen.queryByRole("link", { name: "Trang quản trị" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Mở menu phụ huynh" }));
    expect(screen.queryByRole("link", { name: "Trang quản trị" })).not.toBeInTheDocument();
  });
});
